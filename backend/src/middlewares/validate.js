const { AppError } = require('../utils/errors');

function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req[source]);
        if (!parsed.success) {
            return next(new AppError('Validation failed', 400, parsed.error.flatten()));
        }

        req[source] = parsed.data;
        next();
    };
}

module.exports = { validate };
