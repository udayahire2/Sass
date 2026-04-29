function sendSuccess(res, {
    statusCode = 200,
    message = 'Request successful',
    data = null,
    pagination = null,
    legacy = {},
} = {}) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        error: null,
        pagination,
        ...legacy,
    });
}

function sendFailure(res, {
    statusCode = 500,
    message = 'Request failed',
    error = null,
    pagination = null,
    legacy = {},
} = {}) {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null,
        error,
        pagination,
        ...legacy,
    });
}

module.exports = { sendSuccess, sendFailure };
