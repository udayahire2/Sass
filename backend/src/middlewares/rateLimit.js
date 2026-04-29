const { sendFailure } = require('../utils/response');

function createRateLimiter({ windowMs, max, message, keyPrefix }) {
    const store = new Map();

    return (req, res, next) => {
        const key = `${keyPrefix}:${req.ip}`;
        const now = Date.now();
        const current = store.get(key);

        if (!current || current.resetAt <= now) {
            store.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }

        if (current.count >= max) {
            res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
            return sendFailure(res, {
                statusCode: 429,
                message,
                error: { code: 'RATE_LIMITED' },
            });
        }

        current.count += 1;
        store.set(key, current);
        next();
    };
}

module.exports = { createRateLimiter };
