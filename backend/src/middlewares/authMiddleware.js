const { AppError } = require('../utils/errors');
const { parseCookies } = require('../utils/cookies');
const { verifyAccessToken } = require('../utils/authTokens');
const { formatUserWithRelations, get } = require('../services/dbService');

function getAccessTokenFromRequest(req) {
    const authorization = req.headers.authorization || '';
    if (authorization.startsWith('Bearer ')) {
        return authorization.slice(7).trim();
    }

    const cookies = parseCookies(req);
    return cookies.access_token || null;
}

function loadAuthenticatedUser(req, _res, next) {
    try {
        const token = getAccessTokenFromRequest(req);
        if (!token) {
            return next(new AppError('Authentication required', 401));
        }

        const payload = verifyAccessToken(token);
        const userRow = get(
            `SELECT *
             FROM users
             WHERE id = ? AND deleted_at IS NULL`,
            [payload.sub]
        );

        if (!userRow) {
            return next(new AppError('User not found', 401));
        }

        req.user = formatUserWithRelations(userRow);
        return next();
    } catch (error) {
        return next(new AppError('Invalid or expired access token', 401));
    }
}

function optionalAuth(req, _res, next) {
    try {
        const token = getAccessTokenFromRequest(req);
        if (!token) {
            return next();
        }

        const payload = verifyAccessToken(token);
        const userRow = get(
            `SELECT *
             FROM users
             WHERE id = ? AND deleted_at IS NULL`,
            [payload.sub]
        );

        if (userRow) {
            req.user = formatUserWithRelations(userRow);
        }
    } catch (_error) {
        req.user = null;
    }

    next();
}

function requireRoles(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
}

function requireApprovedFaculty(req, _res, next) {
    if (!req.user) {
        return next(new AppError('Authentication required', 401));
    }

    if (req.user.role === 'faculty' && !req.user.isApproved) {
        return next(new AppError('Faculty account is pending approval', 403));
    }

    next();
}

module.exports = {
    authorize: requireRoles,
    loadAuthenticatedUser,
    optionalAuth,
    protect: loadAuthenticatedUser,
    requireApprovedFaculty,
    requireRoles,
};
