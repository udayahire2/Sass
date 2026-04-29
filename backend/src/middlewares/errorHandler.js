const { ZodError } = require('zod');

const { AppError } = require('../utils/errors');
const { sendFailure } = require('../utils/response');

function notFound(req, _res, next) {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

function errorHandler(error, _req, res, _next) {
    if (error instanceof ZodError) {
        return sendFailure(res, {
            statusCode: 400,
            message: 'Validation failed',
            error: error.flatten(),
        });
    }

    if (error instanceof AppError) {
        return sendFailure(res, {
            statusCode: error.statusCode,
            message: error.message,
            error: error.details,
        });
    }

    console.error(error);
    return sendFailure(res, {
        statusCode: 500,
        message: 'Internal server error',
        error: null,
    });
}

module.exports = { errorHandler, notFound };
