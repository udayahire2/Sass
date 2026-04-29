function sanitizeString(value) {
    return value.replace(/\u0000/g, '').trim();
}

function sanitizeValue(value) {
    if (typeof value === 'string') {
        return sanitizeString(value);
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item));
    }

    if (value && typeof value === 'object') {
        const sanitized = {};
        for (const [key, child] of Object.entries(value)) {
            sanitized[key] = sanitizeValue(child);
        }
        return sanitized;
    }

    return value;
}

function sanitizeRequest(req, _res, next) {
    req.body = sanitizeValue(req.body || {});
    req.query = sanitizeValue(req.query || {});
    req.params = sanitizeValue(req.params || {});
    next();
}

module.exports = { sanitizeRequest };
