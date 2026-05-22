const express = require('express');

const {
    getSubjectsByBranchSemester,
    getTopicById,
    getUnitsBySubject,
    updateTopic,
} = require('../services/subjectService');
const { AppError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/subjects', (req, res, next) => {
    try {
        const { branch, semester } = req.query;

        if (!branch || !semester) {
            return next(new AppError('Branch and semester are required', 400));
        }

        const semesterNumber = Number(semester);
        if (!Number.isInteger(semesterNumber) || semesterNumber < 1) {
            return next(new AppError('Semester must be a positive integer', 400));
        }

        const subjects = getSubjectsByBranchSemester(String(branch), semesterNumber);
        return sendSuccess(res, {
            message: 'Subjects fetched successfully',
            data: subjects,
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/subjects/:id/units', (req, res, next) => {
    try {
        const units = getUnitsBySubject(req.params.id);
        return sendSuccess(res, {
            message: 'Units fetched successfully',
            data: units,
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/topics/:id', (req, res, next) => {
    try {
        const topic = getTopicById(req.params.id);

        if (!topic) {
            return next(new AppError('Topic not found', 404));
        }

        return sendSuccess(res, {
            message: 'Topic fetched successfully',
            data: topic,
        });
    } catch (error) {
        return next(error);
    }
});

router.put('/topics/:id', protect, authorize('admin'), (req, res, next) => {
    try {
        const topic = getTopicById(req.params.id);

        if (!topic) {
            return next(new AppError('Topic not found', 404));
        }

        const updatedTopic = updateTopic(req.params.id, req.body);

        return sendSuccess(res, {
            message: 'Topic updated successfully',
            data: updatedTopic,
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
