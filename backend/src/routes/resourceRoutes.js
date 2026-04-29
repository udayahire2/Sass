const express = require('express');
const {
    getResources,
    getResource,
    createResource,
    updateResource,
    deleteResource
} = require('../controllers/resourceController');
const { optionalAuth, protect, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { createResourceSchema, paginationQuerySchema } = require('../validation/schemas');

const router = express.Router();
const updateResourceSchema = createResourceSchema.partial();

router.route('/')
    .get(optionalAuth, validate(paginationQuerySchema, 'query'), getResources)
    .post(protect, authorize('admin'), validate(createResourceSchema), createResource);

router.route('/:id')
    .get(optionalAuth, getResource)
    .patch(protect, authorize('admin'), validate(updateResourceSchema), updateResource)
    .delete(protect, authorize('admin'), deleteResource);

module.exports = router;
