const express = require('express');
const fs = require('node:fs');
const multer = require('multer');
const path = require('node:path');
const { getSyllabus, createSyllabus, deleteSyllabus } = require('../controllers/syllabusController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { AppError } = require('../utils/errors');
const { get } = require('../services/dbService');
const { getContentType, resolveUploadPath, streamLocalFile } = require('../utils/fileProxy');
const { validate } = require('../middlewares/validate');
const { createSyllabusSchema, paginationQuerySchema } = require('../validation/schemas');

const router = express.Router();

const FILE_TYPE_BY_EXTENSION = {
    '.pdf': 'pdf',
    '.md': 'markdown',
    '.markdown': 'markdown',
    '.txt': 'markdown',
};

const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/syllabus');
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
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter(_req, file, cb) {
        const type = FILE_TYPE_BY_EXTENSION[path.extname(file.originalname).toLowerCase()];
        if (type) {
            cb(null, true);
            return;
        }

        cb(new Error('Only PDF, Markdown, or text syllabus files can be uploaded'));
    },
});

function prepareSyllabusUpload(req, _res, next) {
    if (!req.file) {
        return next();
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    const type = FILE_TYPE_BY_EXTENSION[extension];
    req.body.type = type;

    if (type === 'markdown') {
        req.body.contentUrl = fs.readFileSync(req.file.path, 'utf8');
    } else {
        req.body.contentUrl = `/uploads/syllabus/${req.file.filename}`;
    }

    return next();
}

router.route('/')
    .get(validate(paginationQuerySchema, 'query'), getSyllabus)
    .post(
        protect,
        authorize('admin'),
        upload.single('file'),
        prepareSyllabusUpload,
        validate(createSyllabusSchema),
        createSyllabus
    );

router.get('/:id/file', async (req, res, next) => {
    try {
        const syllabus = get(
            `SELECT *
             FROM syllabi
             WHERE id = ? AND deleted_at IS NULL`,
            [req.params.id]
        );

        if (!syllabus || !syllabus.content_url) {
            return next(new AppError('File not found', 404));
        }

        const filePath = resolveUploadPath(syllabus.content_url, { requiredPrefix: 'syllabus' });
        if (!filePath) {
            return next(new AppError('File not found', 404));
        }

        const streamed = await streamLocalFile(res, filePath, {
            contentType: getContentType(filePath),
            downloadName: path.basename(filePath),
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
    .delete(protect, authorize('admin'), deleteSyllabus);

module.exports = router;
