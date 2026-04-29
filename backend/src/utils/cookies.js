const { env } = require('../config/env');

function parseCookies(req) {
    const header = req.headers.cookie;
    if (!header) {
        return {};
    }

    return header.split(';').reduce((acc, part) => {
        const [rawName, ...rawValue] = part.trim().split('=');
        if (!rawName) {
            return acc;
        }

        acc[rawName] = decodeURIComponent(rawValue.join('='));
        return acc;
    }, {});
}

function setRefreshCookie(res, token, expiresAt) {
    res.cookie(env.refreshCookieName, token, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
        path: '/api/v1/auth',
        expires: new Date(expiresAt),
    });
}

function clearRefreshCookie(res) {
    res.clearCookie(env.refreshCookieName, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
        path: '/api/v1/auth',
    });
}

module.exports = { parseCookies, setRefreshCookie, clearRefreshCookie };
