const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const { materialUploadBodySchema, updateMaterialStatusSchema } = require('../validation/schemas');
const { protect, authorize, requireApprovedFaculty } = require('../middlewares/authMiddleware');
const { cache } = require('../config/cache');
const { createTimestamps, formatStudyMaterial, get, run, all } = require('../services/dbService');

const FILE_TYPE_BY_EXTENSION = {
    '.pdf': 'PDF',
    '.ppt': 'PPT',
    '.pptx': 'PPT',
    '.docx': 'DOCX',
    '.md': 'Markdown',
};

const ALLOWED_EXTENSIONS = Object.keys(FILE_TYPE_BY_EXTENSION);

function getFileType(originalName) {
    return FILE_TYPE_BY_EXTENSION[path.extname(originalName).toLowerCase()] || null;
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/');
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            try {
                fs.mkdirSync(uploadPath, { recursive: true });
            } catch (err) {
                console.error('Error creating upload directory:', err);
            }
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Sanitize filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    if (getFileType(file.originalname)) {
        return cb(null, true);
    }

    cb(new Error(`Only ${ALLOWED_EXTENSIONS.join(', ')} files can be uploaded`));
}

// @desc    Get all materials uploaded by the logged-in user
// @route   GET /api/v1/study-materials/my
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const materials = all(
            `SELECT *
             FROM study_materials
             WHERE uploader_user_id = ? AND deleted_at IS NULL
             ORDER BY created_at DESC`,
            [req.user.id]
        ).map((row) => formatStudyMaterial(row));

        res.status(200).json({
            success: true,
            data: materials,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Get all approved materials (Student View)
// @route   GET /api/v1/study-materials/approved
// @access  Public
router.get('/approved', async (req, res) => {
    try {
        const materials = all(
            `SELECT *
             FROM study_materials
             WHERE status = 'approved' AND deleted_at IS NULL
             ORDER BY created_at DESC`
        ).map((row) => formatStudyMaterial(row));

        res.status(200).json({
            success: true,
            data: materials,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Get all pending materials (Admin View)
// @route   GET /api/v1/study-materials/pending
// @access  Private (Admin)
router.get('/pending', protect, authorize('admin'), async (req, res) => {
    try {
        const materials = all(
            `SELECT *
             FROM study_materials
             WHERE status = 'pending' AND deleted_at IS NULL
             ORDER BY created_at DESC`
        ).map((row) => formatStudyMaterial(row));

        res.status(200).json({
            success: true,
            data: materials,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Get all rejected materials (Admin View)
// @route   GET /api/v1/study-materials/rejected
// @access  Private (Admin)
router.get('/rejected', protect, authorize('admin'), async (req, res) => {
    try {
        const materials = all(
            `SELECT *
             FROM study_materials
             WHERE status = 'rejected' AND deleted_at IS NULL
             ORDER BY updated_at DESC`
        ).map((row) => formatStudyMaterial(row));

        res.status(200).json({
            success: true,
            data: materials,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Upload/Create new study content for admin review
// @route   POST /api/v1/study-materials
// @access  Private (students, admins, and approved faculty)
router.post('/', protect, requireApprovedFaculty, upload.single('file'), async (req, res) => {
    try {
        const parsed = materialUploadBodySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                error: parsed.error.flatten(),
            });
        }

        const { title, subject, url, author } = parsed.data;

        if (!req.file && !url) {
            return res.status(400).json({
                success: false,
                message: 'Either a file upload or a URL is required',
            });
        }

        let filePath = null;
        if (req.file) {
            // Store relative path for frontend access
            // On Windows, paths might have backslashes, normalize to forward slashes for URLs
            filePath = `/uploads/${req.file.filename}`;
        }

        const inferredType = req.file ? getFileType(req.file.originalname) : parsed.data.type;
        if (!inferredType) {
            return res.status(400).json({
                success: false,
                message: `Unsupported file type. Upload ${ALLOWED_EXTENSIONS.join(', ')} files.`,
            });
        }

        if (parsed.data.type && parsed.data.type !== inferredType) {
            return res.status(400).json({
                success: false,
                message: `Selected type does not match uploaded file. Expected ${inferredType}.`,
            });
        }

        const timestamps = createTimestamps();
        const materialId = crypto.randomUUID();

        run(
            `INSERT INTO study_materials (
                id, subject_id, title, subject, type, url, file_path, original_filename, mime_type, file_size,
                status, author, uploader_user_id,
                approved_by_user_id, approved_at, rejection_reason, created_at, updated_at, deleted_at
            ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NULL, NULL, NULL, ?, ?, NULL)`,
            [
                materialId,
                title,
                subject,
                inferredType,
                url || null,
                filePath,
                req.file?.originalname || null,
                req.file?.mimetype || null,
                req.file?.size || null,
                author || req.user.name || 'Student',
                req.user.id,
                timestamps.createdAt,
                timestamps.updatedAt,
            ]
        );

        await cache.del('admin:stats');

        const newMaterial = formatStudyMaterial(
            get(
                `SELECT *
                 FROM study_materials
                 WHERE id = ? AND deleted_at IS NULL`,
                [materialId]
            )
        );

        res.status(201).json({
            success: true,
            data: newMaterial,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
});

// @desc    Update material status (Approve/Reject)
// @route   PATCH /api/v1/study-materials/:id/status
// @access  Private (Admin)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const parsed = updateMaterialStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                error: parsed.error.flatten(),
            });
        }

        const { status, reason } = parsed.data;
        const material = get(
            `SELECT *
             FROM study_materials
             WHERE id = ? AND deleted_at IS NULL`,
            [req.params.id]
        );

        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found' });
        }

        const timestamps = createTimestamps();
        run(
            `UPDATE study_materials
             SET status = ?,
                 approved_by_user_id = ?,
                 approved_at = ?,
                 rejection_reason = ?,
                 updated_at = ?
             WHERE id = ? AND deleted_at IS NULL`,
            [
                status,
                req.user.id,
                status === 'approved' ? timestamps.updatedAt : null,
                status === 'rejected' ? reason || null : null,
                timestamps.updatedAt,
                material.id,
            ]
        );

        await cache.del('admin:stats');

        const updatedMaterial = formatStudyMaterial(
            get(
                `SELECT *
                 FROM study_materials
                 WHERE id = ? AND deleted_at IS NULL`,
                [material.id]
            )
        );

        res.status(200).json({
            success: true,
            data: updatedMaterial,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
