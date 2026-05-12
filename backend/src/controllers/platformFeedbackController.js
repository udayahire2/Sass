const crypto = require('node:crypto');
const { all, createTimestamps, get, run } = require('../services/dbService');
const { AppError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');

exports.submitFeedback = async (req, res, next) => {
    try {
        const { type, message } = req.body;
        if (!type || !message) {
            return next(new AppError('Type and message are required', 400));
        }

        const timestamps = createTimestamps();
        const feedbackId = crypto.randomUUID();

        run(
            `INSERT INTO platform_feedback (
                id, user_id, type, message, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
            [
                feedbackId,
                req.user.id,
                type,
                message,
                timestamps.createdAt,
                timestamps.updatedAt,
            ]
        );

        return sendSuccess(res, {
            statusCode: 201,
            message: 'Feedback submitted successfully',
            data: { id: feedbackId }
        });
    } catch (error) {
        return next(error);
    }
};

exports.getFeedback = async (req, res, next) => {
    try {
        const feedback = all(
            `SELECT pf.*, u.first_name, u.last_name, u.email 
             FROM platform_feedback pf
             JOIN users u ON pf.user_id = u.id
             WHERE pf.deleted_at IS NULL
             ORDER BY pf.created_at DESC`
        );

        return sendSuccess(res, {
            message: 'Feedback fetched successfully',
            data: feedback,
        });
    } catch (error) {
        return next(error);
    }
};

exports.updateFeedbackStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['pending', 'reviewed', 'resolved'].includes(status)) {
            return next(new AppError('Invalid status', 400));
        }

        const existing = get(`SELECT * FROM platform_feedback WHERE id = ? AND deleted_at IS NULL`, [req.params.id]);
        if (!existing) {
            return next(new AppError('Feedback not found', 404));
        }

        const timestamps = createTimestamps();
        run(
            `UPDATE platform_feedback SET status = ?, updated_at = ? WHERE id = ?`,
            [status, timestamps.updatedAt, existing.id]
        );

        return sendSuccess(res, {
            message: 'Feedback status updated successfully',
        });
    } catch (error) {
        return next(error);
    }
};

exports.deleteFeedback = async (req, res, next) => {
    try {
        const existing = get(`SELECT * FROM platform_feedback WHERE id = ? AND deleted_at IS NULL`, [req.params.id]);
        if (!existing) {
            return next(new AppError('Feedback not found', 404));
        }

        const timestamps = createTimestamps();
        run(
            `UPDATE platform_feedback SET deleted_at = ?, updated_at = ? WHERE id = ?`,
            [timestamps.updatedAt, timestamps.updatedAt, existing.id]
        );

        return sendSuccess(res, {
            message: 'Feedback deleted successfully',
        });
    } catch (error) {
        return next(error);
    }
};
