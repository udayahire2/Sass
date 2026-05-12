const express = require('express');
const fs = require('node:fs');
const multer = require('multer');
const path = require('node:path');
const {
    getResources,
    getResource,
    createResource,
    updateResource,
    deleteResource
} = require('../controllers/resourceController');
const { optionalAuth, protect, authorize } = require('../middlewares/authMiddleware');
const { AppError } = require('../utils/errors');
const { get } = require('../services/dbService');
const { getContentType, resolveUploadPath, streamLocalFile } = require('../utils/fileProxy');
const { validate } = require('../middlewares/validate');
const { createResourceSchema, paginationQuerySchema } = require('../validation/schemas');

const router = express.Router();
const updateResourceSchema = createResourceSchema.partial();

const RESOURCE_FILE_EXTENSIONS = {
    '.pdf': 'pdf',
    '.doc': 'doc',
    '.docx': 'doc',
    '.ppt': 'doc',
    '.pptx': 'doc',
    '.md': 'markdown',
    '.markdown': 'markdown',
    '.txt': 'markdown',
};

const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/resources');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename(_req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter(_req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (RESOURCE_FILE_EXTENSIONS[ext]) {
            cb(null, true);
            return;
        }
        cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, Markdown, or text files can be uploaded'));
    },
});

function prepareResourceUpload(req, _res, next) {
    if (!req.file) {
        return next();
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    const type = RESOURCE_FILE_EXTENSIONS[extension] || 'pdf';

    // Set the type based on file extension if not explicitly set
    if (!req.body.type || req.body.sourceMode === 'upload') {
        req.body.type = type;
    }

    // Store the file path as the url
    req.body.url = `/uploads/resources/${req.file.filename}`;
    req.body.filePath = `/uploads/resources/${req.file.filename}`;
    req.body.originalFilename = req.file.originalname;
    req.body.mimeType = req.file.mimetype;
    req.body.fileSize = req.file.size;

    return next();
}

router.route('/')
    .get(optionalAuth, validate(paginationQuerySchema, 'query'), getResources)
    .post(
        protect,
        authorize('admin'),
        upload.single('file'),
        prepareResourceUpload,
        validate(createResourceSchema),
        createResource
    );

// Serve resource files
router.get('/:id/file', async (req, res, next) => {
    try {
        const resource = get(
            `SELECT *
             FROM resources
             WHERE id = ? AND deleted_at IS NULL`,
            [req.params.id]
        );

        if (!resource) {
            return next(new AppError('Resource not found', 404));
        }

        // Use file_path if available, otherwise try url as a local path
        const storedPath = resource.file_path || resource.url;
        if (!storedPath || /^https?:\/\//i.test(storedPath)) {
            return next(new AppError('File not found', 404));
        }

        const filePath = resolveUploadPath(storedPath, { requiredPrefix: 'resources' });
        if (!filePath) {
            return next(new AppError('File not found', 404));
        }

        const streamed = await streamLocalFile(res, filePath, {
            contentType: resource.mime_type || getContentType(filePath),
            downloadName: resource.original_filename || path.basename(filePath),
        });

        if (!streamed) {
            return next(new AppError('File not found', 404));
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            return next(new AppError('File not found', 404));
        }

        return next(error);
    }
});

router.route('/:id')
    .get(optionalAuth, getResource)
    .patch(
        protect,
        authorize('admin'),
        upload.single('file'),
        prepareResourceUpload,
        validate(updateResourceSchema),
        updateResource
    )
    .delete(protect, authorize('admin'), deleteResource);

module.exports = router;
