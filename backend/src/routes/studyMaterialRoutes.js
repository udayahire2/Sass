const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const { materialUploadBodySchema, updateMaterialStatusSchema, materialFeedbackSchema } = require('../validation/schemas');
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

// @desc    Get faculty contribution stats
// @route   GET /api/v1/study-materials/faculty/stats
// @access  Private (faculty or admin)
router.get('/faculty/stats', protect, async (req, res) => {
    try {
        if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const userId = req.user.id;

        const countRow = (status) => {
            const row = get(
                `SELECT COUNT(*) as count FROM study_materials
                 WHERE uploader_user_id = ? AND status = ? AND deleted_at IS NULL`,
                [userId, status]
            );
            return row ? row.count : 0;
        };

        const totalRow = get(
            `SELECT COUNT(*) as count FROM study_materials
             WHERE uploader_user_id = ? AND deleted_at IS NULL`,
            [userId]
        );

        const feedbackRow = get(
            `SELECT COUNT(*) as count FROM material_feedback
             WHERE reviewer_user_id = ? AND deleted_at IS NULL`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Faculty stats fetched',
            data: {
                total_uploaded: totalRow ? totalRow.count : 0,
                approved_count: countRow('approved'),
                pending_count: countRow('pending'),
                rejected_count: countRow('rejected'),
                feedback_given_count: feedbackRow ? feedbackRow.count : 0,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Submit (or update) feedback on a study material
// @route   POST /api/v1/study-materials/:id/feedback
// @access  Private (approved faculty)
router.post('/:id/feedback', protect, requireApprovedFaculty, async (req, res) => {
    try {
        const parsed = materialFeedbackSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                error: parsed.error.flatten(),
            });
        }

        if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only faculty can give feedback' });
        }

        const material = get(
            `SELECT * FROM study_materials WHERE id = ? AND status = 'approved' AND deleted_at IS NULL`,
            [req.params.id]
        );
        if (!material) {
            return res.status(404).json({ success: false, message: 'Approved study material not found' });
        }

        const { feedback_text, rating } = parsed.data;
        const timestamps = createTimestamps();

        // Upsert: one feedback per faculty per material
        const existing = get(
            `SELECT id FROM material_feedback WHERE study_material_id = ? AND reviewer_user_id = ? AND deleted_at IS NULL`,
            [material.id, req.user.id]
        );

        if (existing) {
            run(
                `UPDATE material_feedback
                 SET feedback_text = ?, rating = ?, updated_at = ?
                 WHERE id = ?`,
                [feedback_text, rating, timestamps.updatedAt, existing.id]
            );
        } else {
            const feedbackId = crypto.randomUUID();
            run(
                `INSERT INTO material_feedback (id, study_material_id, reviewer_user_id, feedback_text, rating, created_at, updated_at, deleted_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
                [feedbackId, material.id, req.user.id, feedback_text, rating, timestamps.createdAt, timestamps.updatedAt]
            );
        }

        const saved = get(
            `SELECT mf.*, u.first_name, u.last_name
             FROM material_feedback mf
             JOIN users u ON u.id = mf.reviewer_user_id
             WHERE mf.study_material_id = ? AND mf.reviewer_user_id = ? AND mf.deleted_at IS NULL`,
            [material.id, req.user.id]
        );

        return res.status(200).json({
            success: true,
            message: existing ? 'Feedback updated' : 'Feedback submitted',
            data: formatFeedbackRow(saved),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Get all feedback for a study material
// @route   GET /api/v1/study-materials/:id/feedback
// @access  Private
router.get('/:id/feedback', protect, async (req, res) => {
    try {
        const rows = all(
            `SELECT mf.*, u.first_name, u.last_name
             FROM material_feedback mf
             JOIN users u ON u.id = mf.reviewer_user_id
             WHERE mf.study_material_id = ? AND mf.deleted_at IS NULL
             ORDER BY mf.created_at DESC`,
            [req.params.id]
        );

        return res.status(200).json({
            success: true,
            message: 'Feedback fetched',
            data: rows.map(formatFeedbackRow),
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFeedbackRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        studyMaterialId: row.study_material_id,
        reviewerUserId: row.reviewer_user_id,
        reviewerName: [row.first_name, row.last_name].filter(Boolean).join(' ').trim(),
        feedbackText: row.feedback_text,
        rating: row.rating,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

module.exports = router;
