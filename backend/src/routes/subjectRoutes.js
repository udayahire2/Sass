const express = require('express');

const {
    getSubjectsByBranchSemester,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
    getTopicById,
    getUnitsBySubject,
    getUnitById,
    createUnit,
    updateUnit,
    deleteUnit,
    updateTopic,
    createTopic,
    deleteTopic,
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

router.post('/units/:id/topics', protect, authorize('admin'), (req, res, next) => {
    try {
        const topic = createTopic(req.params.id, req.body);
        return sendSuccess(res, { message: 'Topic created successfully', data: topic });
    } catch (error) {
        return next(error);
    }
});

router.delete('/topics/:id', protect, authorize('admin'), (req, res, next) => {
    try {
        deleteTopic(req.params.id);
        return sendSuccess(res, { message: 'Topic deleted successfully' });
    } catch (error) {
        return next(error);
    }
});

router.post('/subjects', protect, authorize('admin'), (req, res, next) => {
    try {
        const subject = createSubject(req.body);
        return sendSuccess(res, { message: 'Subject created successfully', data: subject });
    } catch (error) {
        return next(error);
    }
});

router.put('/subjects/:id', protect, authorize('admin'), (req, res, next) => {
    try {
        const subject = updateSubject(req.params.id, req.body);
        if (!subject) return next(new AppError('Subject not found', 404));
        return sendSuccess(res, { message: 'Subject updated successfully', data: subject });
    } catch (error) {
        return next(error);
    }
});

router.delete('/subjects/:id', protect, authorize('admin'), (req, res, next) => {
    try {
        deleteSubject(req.params.id);
        return sendSuccess(res, { message: 'Subject deleted successfully' });
    } catch (error) {
        return next(error);
    }
});

router.post('/subjects/:id/units', protect, authorize('admin'), (req, res, next) => {
    try {
        const unit = createUnit(req.params.id, req.body);
        return sendSuccess(res, { message: 'Unit created successfully', data: unit });
    } catch (error) {
        return next(error);
    }
});

router.put('/units/:id', protect, authorize('admin'), (req, res, next) => {
    try {
        const unit = updateUnit(req.params.id, req.body);
        if (!unit) return next(new AppError('Unit not found', 404));
        return sendSuccess(res, { message: 'Unit updated successfully', data: unit });
    } catch (error) {
        return next(error);
    }
});

router.delete('/units/:id', protect, authorize('admin'), (req, res, next) => {
    try {
        deleteUnit(req.params.id);
        return sendSuccess(res, { message: 'Unit deleted successfully' });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
