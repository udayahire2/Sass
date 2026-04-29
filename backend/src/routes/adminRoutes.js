const express = require('express');
const {
    getStats,
    getProfile,
    updateProfile,
    getUsers,
    deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { adminProfileSchema, paginationQuerySchema } = require('../validation/schemas');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/profile', getProfile);
router.patch('/profile', validate(adminProfileSchema), updateProfile);
router.get('/users', validate(paginationQuerySchema, 'query'), getUsers);
router.delete('/users/:id', deleteUser);

// Faculty Management
const { getPendingFaculty, getAllFaculty, approveFaculty, rejectFaculty } = require('../controllers/adminController');
router.get('/faculty/pending', getPendingFaculty);
router.get('/faculty/all', getAllFaculty);
router.patch('/faculty/:id/approve', approveFaculty);
router.patch('/faculty/:id/reject', rejectFaculty);

module.exports = router;
