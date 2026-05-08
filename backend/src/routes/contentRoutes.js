const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const fs = require('node:fs');
const multer = require('multer');
const path = require('node:path');

const { contentQuerySchema, contentUploadBodySchema } = require('../validation/schemas');
const { protect, requireApprovedFaculty } = require('../middlewares/authMiddleware');
const { all, createTimestamps, formatContent, get, run } = require('../services/dbService');

const FILE_FORMAT_BY_EXTENSION = {
    '.pdf': 'pdf',
    '.ppt': 'ppt',
    '.pptx': 'ppt',
    '.doc': 'doc',
    '.docx': 'doc',
    '.md': 'markdown',
    '.mp4': 'video',
    '.mov': 'video',
    '.webm': 'video',
};

const ALLOWED_EXTENSIONS = Object.keys(FILE_FORMAT_BY_EXTENSION);
const UPLOAD_DIR = path.join(__dirname, '../../uploads/content');

function getResourceFormat(originalName) {
    return FILE_FORMAT_BY_EXTENSION[path.extname(originalName).toLowerCase()] || null;
}

const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        cb(null, UPLOAD_DIR);
    },
    filename(_req, file, cb) {
        const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${suffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter(_req, file, cb) {
        if (getResourceFormat(file.originalname)) {
            return cb(null, true);
        }

        return cb(new Error(`Only ${ALLOWED_EXTENSIONS.join(', ')} files can be uploaded`));
    },
});

function getContentRow(contentId) {
    return get(
        `SELECT sc.*, u.first_name, u.last_name, u.avatar_url
         FROM study_content sc
         LEFT JOIN users u ON u.id = sc.uploader_user_id
         WHERE sc.id = ? AND sc.deleted_at IS NULL`,
        [contentId]
    );
}

function canDeleteContent(req, content) {
    return req.user?.role === 'admin' || content.uploader_user_id === req.user?.id;
}

// @desc    Fetch content with optional type, role, and date sorting filters
// @route   GET /api/v1/content?type=study_stock&role=faculty&sort=date_desc
// @access  Public
router.get('/', async (req, res) => {
    try {
        const parsed = contentQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                error: parsed.error.flatten(),
            });
        }

        const filters = ['sc.deleted_at IS NULL'];
        const params = [];

        if (parsed.data.type) {
            filters.push('sc.type = ?');
            params.push(parsed.data.type);
        }

        if (parsed.data.role) {
            filters.push('sc.uploader_role = ?');
            params.push(parsed.data.role);
        }

        const order = parsed.data.sort === 'date_asc' ? 'ASC' : 'DESC';
        const rows = all(
            `SELECT sc.*, u.first_name, u.last_name, u.avatar_url
             FROM study_content sc
             LEFT JOIN users u ON u.id = sc.uploader_user_id
             WHERE ${filters.join(' AND ')}
             ORDER BY sc.created_at ${order}`,
            params
        );

        return res.status(200).json({
            success: true,
            data: rows.map(formatContent),
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Upload/create content
// @route   POST /api/v1/content
// @access  Private (students, admins, and approved faculty)
router.post('/', protect, requireApprovedFaculty, upload.single('file'), async (req, res) => {
    try {
        const parsed = contentUploadBodySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                error: parsed.error.flatten(),
            });
        }

        if (!req.file && !parsed.data.fileUrl) {
            return res.status(400).json({
                success: false,
                message: 'Either a file upload or a fileUrl is required',
            });
        }

        const timestamps = createTimestamps();
        const contentId = crypto.randomUUID();
        const fileUrl = req.file ? `/uploads/content/${req.file.filename}` : parsed.data.fileUrl;
        const resourceFormat = req.file ? getResourceFormat(req.file.originalname) : 'link';

        run(
            `INSERT INTO study_content (
                id, title, type, uploader_role, uploader_user_id, uploader_name, file_url, description,
                resource_format, original_filename, mime_type, file_size, created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
            [
                contentId,
                parsed.data.title,
                parsed.data.type,
                req.user.role,
                req.user.id,
                req.user.name || 'Unknown uploader',
                fileUrl,
                parsed.data.description || '',
                resourceFormat,
                req.file?.originalname || null,
                req.file?.mimetype || null,
                req.file?.size || null,
                timestamps.createdAt,
                timestamps.updatedAt,
            ]
        );

        return res.status(201).json({
            success: true,
            data: formatContent(getContentRow(contentId)),
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
});

// @desc    Download or stream an uploaded content file
// @route   GET /api/v1/content/:id/file
// @access  Public
router.get('/:id/file', async (req, res) => {
    try {
        const content = getContentRow(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        if (/^https?:\/\//i.test(content.file_url)) {
            return res.redirect(content.file_url);
        }

        const normalized = content.file_url.replace(/^\/+/, '');
        const filePath = path.resolve(__dirname, '../../', normalized);
        const uploadRoot = path.resolve(__dirname, '../../uploads');

        if (!filePath.startsWith(uploadRoot) || !fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        return res.sendFile(filePath);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Delete content
// @route   DELETE /api/v1/content/:id
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const content = getContentRow(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        if (!canDeleteContent(req, content)) {
            return res.status(403).json({
                success: false,
                message: 'Only the uploader or an admin can delete this content',
            });
        }

        const timestamps = createTimestamps();
        run(
            `UPDATE study_content
             SET deleted_at = ?, updated_at = ?
             WHERE id = ? AND deleted_at IS NULL`,
            [timestamps.updatedAt, timestamps.updatedAt, content.id]
        );

        return res.status(200).json({
            success: true,
            message: 'Content deleted successfully',
            data: {},
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

