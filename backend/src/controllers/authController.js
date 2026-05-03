const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const { env } = require('../config/env');
const { AppError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');
const { clearRefreshCookie, parseCookies, setRefreshCookie } = require('../utils/cookies');
const {
    comparePassword,
    generateOtp,
    hashPassword,
    hashToken,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require('../utils/authTokens');
const { enqueueJob } = require('../services/jobQueue');
const {
    createTimestamps,
    formatUserWithRelations,
    get,
    run,
    splitName,
    transaction,
} = require('../services/dbService');

const OTP_PURPOSE = 'account_verification';
const DEFAULT_STUDENT_AVATARS = [
    'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg',
    'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg',
    'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg',
    'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg',
    'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg',
    'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/black.jpg',
];

function getUserByEmail(email) {
    return get(
        `SELECT *
         FROM users
         WHERE email = ? AND deleted_at IS NULL`,
        [email.toLowerCase()]
    );
}

function getUserById(id) {
    return get(
        `SELECT *
         FROM users
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
    );
}

function getRefreshTokenFromRequest(req) {
    const cookies = parseCookies(req);
    return cookies[env.refreshCookieName] || null;
}

function revokeRefreshFamily(familyId) {
    run(
        `UPDATE refresh_tokens
         SET revoked_at = COALESCE(revoked_at, ?), updated_at = ?
         WHERE family_id = ? AND deleted_at IS NULL`,
        [new Date().toISOString(), new Date().toISOString(), familyId]
    );
}

function pickRandomStudentAvatar() {
    return DEFAULT_STUDENT_AVATARS[crypto.randomInt(DEFAULT_STUDENT_AVATARS.length)];
}

function ensureStudentAvatar(user) {
    if (!user || user.role !== 'student' || user.avatarUrl) {
        return user;
    }

    const avatarUrl = pickRandomStudentAvatar();
    const timestamps = createTimestamps();

    run(
        `UPDATE users
         SET avatar_url = ?, updated_at = ?
         WHERE id = ? AND deleted_at IS NULL AND (avatar_url IS NULL OR avatar_url = '')`,
        [avatarUrl, timestamps.updatedAt, user.id]
    );

    const userRow = getUserById(user.id);
    return formatUserWithRelations(userRow);
}

function persistOtp(user) {
    const otp = generateOtp();
    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  📧 OTP for ${user.email}`);
    console.log(`║  🔑 Code: ${otp}`);
    console.log(`╚══════════════════════════════════════════════╝\n`);
    const timestamps = createTimestamps();
    const otpId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    transaction(() => {
        run(
            `UPDATE email_otps
             SET deleted_at = ?, updated_at = ?
             WHERE email = ? AND purpose = ? AND used_at IS NULL AND deleted_at IS NULL`,
            [timestamps.updatedAt, timestamps.updatedAt, user.email, OTP_PURPOSE]
        );

        run(
            `INSERT INTO email_otps (
                id, user_id, email, purpose, otp_hash, expires_at, used_at, created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, NULL)`,
            [
                otpId,
                user.id,
                user.email,
                OTP_PURPOSE,
                hashToken(otp),
                expiresAt,
                timestamps.createdAt,
                timestamps.updatedAt,
            ]
        );
    });

    enqueueJob('email.send', {
        email: user.email,
        subject: 'Your Study Hub OTP',
        message: `Your Study Hub verification code is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your Study Hub verification code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });
}

function createSession({ user, req, res, familyId = crypto.randomUUID(), previousTokenId = null }) {
    const sessionUser = ensureStudentAvatar(user);
    const sessionId = crypto.randomUUID();
    const refreshTokenId = crypto.randomUUID();
    const refreshToken = signRefreshToken({ userId: sessionUser.id, familyId, sessionId });
    const refreshPayload = jwt.decode(refreshToken);
    const expiresAt = new Date(refreshPayload.exp * 1000).toISOString();
    const timestamps = createTimestamps();
    const accessToken = signAccessToken(sessionUser);

    transaction(() => {
        run(
            `INSERT INTO refresh_tokens (
                id, user_id, family_id, token_hash, user_agent, ip_address, expires_at, revoked_at,
                replaced_by_token_id, created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, NULL)`,
            [
                refreshTokenId,
                sessionUser.id,
                familyId,
                hashToken(refreshToken),
                req.headers['user-agent'] || '',
                req.ip || req.socket?.remoteAddress || '',
                expiresAt,
                timestamps.createdAt,
                timestamps.updatedAt,
            ]
        );

        if (previousTokenId) {
            run(
                `UPDATE refresh_tokens
                 SET revoked_at = ?, replaced_by_token_id = ?, updated_at = ?
                 WHERE id = ?`,
                [timestamps.updatedAt, refreshTokenId, timestamps.updatedAt, previousTokenId]
            );
        }
    });

    setRefreshCookie(res, refreshToken, expiresAt);

    return {
        token: accessToken,
        refreshTokenExpiresAt: expiresAt,
        user: sessionUser,
    };
}

async function register(req, res, next) {
    try {
        const existingUser = getUserByEmail(req.body.email);
        if (existingUser) {
            return next(new AppError('An account with this email already exists', 409));
        }

        const passwordHash = await hashPassword(req.body.password);
        const timestamps = createTimestamps();
        const userId = crypto.randomUUID();
        const nameParts = splitName(req.body.name);

        transaction(() => {
            run(
                `INSERT INTO users (
                    id, first_name, last_name, email, password_hash, avatar_url, role, is_verified, is_approved,
                    branch, academic_year, designation, department, college_name, created_at, updated_at, deleted_at
                ) VALUES (?, ?, ?, ?, ?, NULL, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
                [
                    userId,
                    nameParts.firstName,
                    nameParts.lastName,
                    req.body.email,
                    passwordHash,
                    req.body.role,
                    req.body.role === 'faculty' ? 0 : 1,
                    req.body.branch || null,
                    req.body.year || null,
                    req.body.designation || null,
                    req.body.department || null,
                    req.body.collegeName || null,
                    timestamps.createdAt,
                    timestamps.updatedAt,
                ]
            );

            if (req.body.role === 'faculty') {
                for (const subjectName of req.body.subjects) {
                    run(
                        `INSERT INTO faculty_subjects (
                            id, faculty_user_id, subject_name, created_at, updated_at, deleted_at
                        ) VALUES (?, ?, ?, ?, ?, NULL)`,
                        [
                            crypto.randomUUID(),
                            userId,
                            subjectName,
                            timestamps.createdAt,
                            timestamps.updatedAt,
                        ]
                    );
                }
            }
        });

        const createdUser = formatUserWithRelations(getUserById(userId));
        persistOtp(createdUser);

        return sendSuccess(res, {
            statusCode: 201,
            message: 'Registration successful. Verify your email with the OTP sent to your inbox.',
            data: {
                email: createdUser.email,
                requiresApproval: createdUser.role === 'faculty',
            },
            legacy: {
                email: createdUser.email,
                requiresApproval: createdUser.role === 'faculty',
            },
        });
    } catch (error) {
        return next(error);
    }
}

async function verifyOtp(req, res, next) {
    try {
        const userRow = getUserByEmail(req.body.email);
        if (!userRow) {
            return next(new AppError('User not found for this email', 404));
        }

        const otpRecord = get(
            `SELECT *
             FROM email_otps
             WHERE email = ?
               AND purpose = ?
               AND used_at IS NULL
               AND deleted_at IS NULL
             ORDER BY created_at DESC
             LIMIT 1`,
            [req.body.email, OTP_PURPOSE]
        );

        if (!otpRecord) {
            return next(new AppError('OTP not found. Please register again to receive a new code.', 400));
        }

        if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
            return next(new AppError('OTP has expired. Please request a new registration flow.', 400));
        }

        if (hashToken(req.body.otp) !== otpRecord.otp_hash) {
            return next(new AppError('Invalid OTP code', 400));
        }

        const timestamps = createTimestamps();
        transaction(() => {
            run(
                `UPDATE email_otps
                 SET used_at = ?, updated_at = ?
                 WHERE id = ?`,
                [timestamps.updatedAt, timestamps.updatedAt, otpRecord.id]
            );
            run(
                `UPDATE users
                 SET is_verified = 1, updated_at = ?
                 WHERE id = ?`,
                [timestamps.updatedAt, userRow.id]
            );
        });

        const user = formatUserWithRelations(getUserById(userRow.id));
        const session = createSession({ user, req, res });

        return sendSuccess(res, {
            message: 'Account verified successfully',
            data: session,
            legacy: {
                token: session.token,
                user: session.user,
                refreshTokenExpiresAt: session.refreshTokenExpiresAt,
            },
        });
    } catch (error) {
        return next(error);
    }
}

async function login(req, res, next) {
    try {
        const userRow = getUserByEmail(req.body.email);
        if (!userRow) {
            return next(new AppError('Invalid email or password', 401));
        }

        const passwordMatches = await comparePassword(req.body.password, userRow.password_hash);
        if (!passwordMatches) {
            return next(new AppError('Invalid email or password', 401));
        }

        if (!userRow.is_verified) {
            persistOtp(formatUserWithRelations(userRow));
            return next(new AppError('Please verify your email first. A fresh OTP has been sent.', 403));
        }

        const user = formatUserWithRelations(userRow);
        const session = createSession({ user, req, res });

        return sendSuccess(res, {
            message: user.role === 'faculty' && !user.isApproved
                ? 'Login successful. Your faculty account is still pending approval.'
                : 'Login successful',
            data: session,
            legacy: {
                token: session.token,
                user: session.user,
                refreshTokenExpiresAt: session.refreshTokenExpiresAt,
            },
        });
    } catch (error) {
        return next(error);
    }
}

function refreshSession(req, res, next) {
    try {
        const refreshToken = getRefreshTokenFromRequest(req);
        if (!refreshToken) {
            return next(new AppError('Refresh token is required', 401));
        }

        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (_error) {
            clearRefreshCookie(res);
            return next(new AppError('Invalid or expired refresh token', 401));
        }

        const tokenRow = get(
            `SELECT *
             FROM refresh_tokens
             WHERE token_hash = ? AND deleted_at IS NULL`,
            [hashToken(refreshToken)]
        );

        if (!tokenRow) {
            revokeRefreshFamily(payload.familyId);
            clearRefreshCookie(res);
            return next(new AppError('Refresh token is no longer valid', 401));
        }

        if (tokenRow.revoked_at || new Date(tokenRow.expires_at).getTime() < Date.now()) {
            revokeRefreshFamily(tokenRow.family_id);
            clearRefreshCookie(res);
            return next(new AppError('Refresh token has been revoked', 401));
        }

        const user = formatUserWithRelations(getUserById(payload.sub));
        if (!user) {
            revokeRefreshFamily(tokenRow.family_id);
            clearRefreshCookie(res);
            return next(new AppError('User no longer exists', 401));
        }

        const session = createSession({
            user,
            req,
            res,
            familyId: tokenRow.family_id,
            previousTokenId: tokenRow.id,
        });

        return sendSuccess(res, {
            message: 'Session refreshed successfully',
            data: session,
            legacy: {
                token: session.token,
                user: session.user,
                refreshTokenExpiresAt: session.refreshTokenExpiresAt,
            },
        });
    } catch (error) {
        return next(error);
    }
}

function logout(req, res, next) {
    try {
        const refreshToken = getRefreshTokenFromRequest(req);
        if (refreshToken) {
            const tokenRow = get(
                `SELECT *
                 FROM refresh_tokens
                 WHERE token_hash = ? AND deleted_at IS NULL`,
                [hashToken(refreshToken)]
            );

            if (tokenRow) {
                revokeRefreshFamily(tokenRow.family_id);
            }
        }

        clearRefreshCookie(res);
        return sendSuccess(res, {
            message: 'Logged out successfully',
            data: null,
        });
    } catch (error) {
        return next(error);
    }
}

function getMe(req, res) {
    return sendSuccess(res, {
        message: 'Current user fetched successfully',
        data: req.user,
        legacy: {
            user: req.user,
        },
    });
}

function getFacultyProfile(req, res, next) {
    if (req.user.role !== 'faculty') {
        return next(new AppError('Access denied. Faculty only.', 403));
    }

    return sendSuccess(res, {
        message: 'Faculty profile fetched successfully',
        data: req.user,
        legacy: {
            user: req.user,
        },
    });
}

function updateDetails(req, res, next) {
    try {
        const timestamps = createTimestamps();
        const updates = [];
        const values = [];

        if (req.body.name) {
            const nameParts = splitName(req.body.name);
            updates.push('first_name = ?', 'last_name = ?');
            values.push(nameParts.firstName, nameParts.lastName);
        }

        if (req.body.branch !== undefined) {
            updates.push('branch = ?');
            values.push(req.body.branch);
        }

        if (req.body.year !== undefined) {
            updates.push('academic_year = ?');
            values.push(req.body.year);
        }

        if (!updates.length) {
            return next(new AppError('No valid fields provided for update', 400));
        }

        updates.push('updated_at = ?');
        values.push(timestamps.updatedAt, req.user.id);

        run(
            `UPDATE users
             SET ${updates.join(', ')}
             WHERE id = ? AND deleted_at IS NULL`,
            values
        );

        const user = formatUserWithRelations(getUserById(req.user.id));

        return sendSuccess(res, {
            message: 'Profile updated successfully',
            data: user,
            legacy: {
                user,
            },
        });
    } catch (error) {
        return next(error);
    }
}

// ── Avatar upload config ─────────────────────────────────────────────
const avatarUploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarUploadDir)) {
    fs.mkdirSync(avatarUploadDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, avatarUploadDir);
    },
    filename(_req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter(_req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'));
        }
    },
});

function updateAvatar(req, res, next) {
    avatarUpload.single('avatar')(req, res, (multerErr) => {
        if (multerErr) {
            return next(new AppError(multerErr.message || 'Avatar upload failed', 400));
        }

        if (!req.file) {
            return next(new AppError('No avatar image provided', 400));
        }

        try {
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;
            const timestamps = createTimestamps();

            // Delete old avatar file if it was a local upload
            const currentUser = getUserById(req.user.id);
            if (currentUser && currentUser.avatar_url && currentUser.avatar_url.startsWith('/uploads/avatars/')) {
                const oldPath = path.join(__dirname, '../..', currentUser.avatar_url);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            run(
                `UPDATE users
                 SET avatar_url = ?, updated_at = ?
                 WHERE id = ? AND deleted_at IS NULL`,
                [avatarUrl, timestamps.updatedAt, req.user.id]
            );

            const user = formatUserWithRelations(getUserById(req.user.id));

            return sendSuccess(res, {
                message: 'Avatar updated successfully',
                data: user,
                avatar_url: avatarUrl,
                legacy: { user, avatar: avatarUrl, avatar_url: avatarUrl },
            });
        } catch (error) {
            return next(error);
        }
    });
}

module.exports = {
    getMe,
    getFacultyProfile,
    login,
    logout,
    refreshSession,
    register,
    updateAvatar,
    updateDetails,
    verifyOtp,
};
