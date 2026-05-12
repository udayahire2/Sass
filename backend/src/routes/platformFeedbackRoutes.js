const express = require('express');
const { submitFeedback, getFeedback, updateFeedbackStatus, deleteFeedback } = require('../controllers/platformFeedbackController');
const { loadAuthenticatedUser, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', loadAuthenticatedUser, submitFeedback);
router.get('/', loadAuthenticatedUser, authorize('admin'), getFeedback);
router.put('/:id/status', loadAuthenticatedUser, authorize('admin'), updateFeedbackStatus);
router.delete('/:id', loadAuthenticatedUser, authorize('admin'), deleteFeedback);

module.exports = router;
