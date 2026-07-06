const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { sendSuccess } = require('../utils/response');
const { getUserProgress, getTopicProgress, updateUserProgress } = require('../services/progressService');

const router = express.Router();

// Get all progress for current user
router.get('/', protect, (req, res, next) => {
    try {
        const progress = getUserProgress(req.user.id);
        return sendSuccess(res, {
            message: 'Progress fetched successfully',
            data: progress,
        });
    } catch (error) {
        return next(error);
    }
});

// Get progress for specific topic for current user
router.get('/topic/:topicId', protect, (req, res, next) => {
    try {
        const progress = getTopicProgress(req.user.id, req.params.topicId);
        return sendSuccess(res, {
            message: 'Topic progress fetched successfully',
            data: progress,
        });
    } catch (error) {
        return next(error);
    }
});

// Update progress for specific topic for current user
router.put('/topic/:topicId', protect, (req, res, next) => {
    try {
        const progress = updateUserProgress(req.user.id, req.params.topicId, req.body);
        return sendSuccess(res, {
            message: 'Topic progress updated successfully',
            data: progress,
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
