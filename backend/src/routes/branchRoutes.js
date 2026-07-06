const express = require('express');

const {
    getAllBranches,
    getActiveBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
} = require('../services/branchService');
const { AppError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        // Admins can see all branches, students only see active ones
        // If query has ?all=true and user is admin, return all
        // For now, we'll return all branches if they query, or we can just return active for public.
        const branches = req.query.all === 'true' ? getAllBranches() : getActiveBranches();
        return sendSuccess(res, {
            message: 'Branches fetched successfully',
            data: branches,
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', (req, res, next) => {
    try {
        const branch = getBranchById(req.params.id);
        if (!branch) return next(new AppError('Branch not found', 404));
        return sendSuccess(res, { data: branch });
    } catch (error) {
        return next(error);
    }
});

router.post('/', protect, authorize('admin'), (req, res, next) => {
    try {
        const branch = createBranch(req.body);
        return sendSuccess(res, { message: 'Branch created', data: branch });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', protect, authorize('admin'), (req, res, next) => {
    try {
        const branch = updateBranch(req.params.id, req.body);
        if (!branch) return next(new AppError('Branch not found', 404));
        return sendSuccess(res, { message: 'Branch updated', data: branch });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', protect, authorize('admin'), (req, res, next) => {
    try {
        deleteBranch(req.params.id);
        return sendSuccess(res, { message: 'Branch deleted' });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
