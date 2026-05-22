const { cache } = require('../config/cache');
const { AppError } = require('../utils/errors');
const { buildPagination, getPagination } = require('../utils/pagination');
const { sendSuccess } = require('../utils/response');
const { enqueueJob } = require('../services/jobQueue');
const { all, createTimestamps, formatUserWithRelations, get, run } = require('../services/dbService');

function mapUsers(rows) {
    return rows.map((row) => formatUserWithRelations(row));
}

async function getStats(_req, res, next) {
    try {
        const stats = await cache.wrap('admin:stats', 60, async () => {
            const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const totalUsers = get(
                `SELECT COUNT(*) AS count
                 FROM users
                 WHERE deleted_at IS NULL`
            ).count;
            const totalResources = get(
                `SELECT
                    (
                        SELECT COUNT(*)
                        FROM resources
                        WHERE deleted_at IS NULL
                    ) +
                    (
                        SELECT COUNT(*)
                        FROM study_materials
                        WHERE deleted_at IS NULL
                    ) AS count`
            ).count;
            const newUsers = get(
                `SELECT COUNT(*) AS count
                 FROM users
                 WHERE deleted_at IS NULL AND created_at >= ?`,
                [since]
            ).count;
            const newResources = get(
                `SELECT
                    (
                        SELECT COUNT(*)
                        FROM resources
                        WHERE deleted_at IS NULL AND created_at >= ?
                    ) +
                    (
                        SELECT COUNT(*)
                        FROM study_materials
                        WHERE deleted_at IS NULL AND created_at >= ?
                    ) AS count`,
                [since, since]
            ).count;

            return {
                totalUsers,
                totalResources,
                newUsers,
                newResources,
            };
        });

        return sendSuccess(res, {
            message: 'Dashboard stats fetched successfully',
            data: stats,
            legacy: {
                stats,
            },
        });
    } catch (error) {
        return next(error);
    }
}

function getUsers(req, res, next) {
    try {
        const { page, limit, offset } = getPagination(req.query, { page: 1, limit: 100 });
        const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : null;
        const params = [];
        const filters = [`role = 'student'`, 'deleted_at IS NULL'];

        if (search) {
            filters.push('(LOWER(first_name || \' \' || last_name) LIKE ? OR LOWER(email) LIKE ?)');
            params.push(search, search);
        }

        const where = filters.join(' AND ');
        const total = get(
            `SELECT COUNT(*) AS count
             FROM users
             WHERE ${where}`,
            params
        ).count;
        const rows = all(
            `SELECT *
             FROM users
             WHERE ${where}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const users = mapUsers(rows);

        return sendSuccess(res, {
            message: 'Users fetched successfully',
            data: users,
            pagination: buildPagination(total, page, limit),
            legacy: {
                users,
            },
        });
    } catch (error) {
        return next(error);
    }
}

async function deleteUser(req, res, next) {
    try {
        const target = get(
            `SELECT *
             FROM users
             WHERE id = ? AND deleted_at IS NULL`,
            [req.params.id]
        );

        if (!target) {
            return next(new AppError('User not found', 404));
        }

        if (target.role === 'admin') {
            return next(new AppError('Admin accounts cannot be deleted from this endpoint', 403));
        }

        const timestamps = createTimestamps();
        run(
            `UPDATE users
             SET deleted_at = ?, updated_at = ?
             WHERE id = ?`,
            [timestamps.updatedAt, timestamps.updatedAt, target.id]
        );

        await cache.del('admin:stats');

        return sendSuccess(res, {
            message: 'User deleted successfully',
            data: null,
        });
    } catch (error) {
        return next(error);
    }
}

function getPendingFaculty(req, res, next) {
    try {
        const { page, limit, offset } = getPagination(req.query, { page: 1, limit: 50 });
        const total = get(
            `SELECT COUNT(*) AS count
             FROM users
             WHERE role = 'faculty'
               AND is_approved = 0
               AND deleted_at IS NULL`
        ).count;
        const data = mapUsers(
            all(
                `SELECT *
                 FROM users
                 WHERE role = 'faculty'
                   AND is_approved = 0
                   AND deleted_at IS NULL
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            )
        );

        return sendSuccess(res, {
            message: 'Pending faculty fetched successfully',
            data,
            pagination: buildPagination(total, page, limit),
        });
    } catch (error) {
        return next(error);
    }
}

function getAllFaculty(req, res, next) {
    try {
        const { page, limit, offset } = getPagination(req.query, { page: 1, limit: 50 });
        const total = get(
            `SELECT COUNT(*) AS count
             FROM users
             WHERE role = 'faculty'
               AND deleted_at IS NULL`
        ).count;
        const data = mapUsers(
            all(
                `SELECT *
                 FROM users
                 WHERE role = 'faculty'
                   AND deleted_at IS NULL
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            )
        );

        return sendSuccess(res, {
            message: 'Faculty list fetched successfully',
            data,
            pagination: buildPagination(total, page, limit),
        });
    } catch (error) {
        return next(error);
    }
}

async function changeFacultyApproval(req, res, next, approved) {
    try {
        const faculty = get(
            `SELECT *
             FROM users
             WHERE id = ?
               AND role = 'faculty'
               AND deleted_at IS NULL`,
            [req.params.id]
        );

        if (!faculty) {
            return next(new AppError('Faculty account not found', 404));
        }

        const timestamps = createTimestamps();
        run(
            `UPDATE users
             SET is_approved = ?, updated_at = ?
             WHERE id = ?`,
            [approved ? 1 : 0, timestamps.updatedAt, faculty.id]
        );

        enqueueJob('email.send', {
            email: faculty.email,
            subject: approved ? 'Faculty access approved' : 'Faculty access updated',
            message: approved
                ? 'Your faculty account has been approved. You can now access Study Hub faculty features.'
                : 'Your faculty access is currently not approved. Please contact the administrator for more information.',
            html: approved
                ? '<p>Your faculty account has been approved. You can now access Study Hub faculty features.</p>'
                : '<p>Your faculty access is currently not approved. Please contact the administrator for more information.</p>',
        });

        const updated = formatUserWithRelations(
            get(
                `SELECT *
                 FROM users
                 WHERE id = ? AND deleted_at IS NULL`,
                [faculty.id]
            )
        );

        return sendSuccess(res, {
            message: approved ? 'Faculty approved successfully' : 'Faculty access updated successfully',
            data: updated,
        });
    } catch (error) {
        return next(error);
    }
}

function approveFaculty(req, res, next) {
    return changeFacultyApproval(req, res, next, true);
}

function rejectFaculty(req, res, next) {
    return changeFacultyApproval(req, res, next, false);
}

function getProfile(req, res) {
    const profile = {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
    };

    return sendSuccess(res, {
        message: 'Admin profile fetched successfully',
        data: profile,
        legacy: {
            profile,
        },
    });
}

async function updateProfile(req, res, next) {
    try {
        const duplicate = req.body.email
            ? get(
                `SELECT *
                 FROM users
                 WHERE email = ?
                   AND id != ?
                   AND deleted_at IS NULL`,
                [req.body.email, req.user.id]
            )
            : null;

        if (duplicate) {
            return next(new AppError('Email is already in use by another account', 409));
        }

        const timestamps = createTimestamps();
        run(
            `UPDATE users
             SET first_name = COALESCE(?, first_name),
                 last_name = COALESCE(?, last_name),
                 email = COALESCE(?, email),
                 updated_at = ?
             WHERE id = ? AND deleted_at IS NULL`,
            [
                req.body.firstName ?? null,
                req.body.lastName ?? null,
                req.body.email ?? null,
                timestamps.updatedAt,
                req.user.id,
            ]
        );

        const fresh = formatUserWithRelations(
            get(
                `SELECT *
                 FROM users
                 WHERE id = ? AND deleted_at IS NULL`,
                [req.user.id]
            )
        );
        const profile = {
            firstName: fresh.firstName,
            lastName: fresh.lastName,
            email: fresh.email,
            avatarUrl: fresh.avatarUrl,
        };

        await cache.del('admin:stats');

        return sendSuccess(res, {
            message: 'Admin profile updated successfully',
            data: profile,
            legacy: {
                profile,
            },
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    approveFaculty,
    deleteUser,
    getAllFaculty,
    getPendingFaculty,
    getProfile,
    getStats,
    getUsers,
    rejectFaculty,
    updateProfile,
};
