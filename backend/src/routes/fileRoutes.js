const express = require('express');

const { optionalAuth } = require('../middlewares/authMiddleware');
const { get } = require('../services/dbService');
const { AppError } = require('../utils/errors');
const { resolveUploadPath, streamLocalFile } = require('../utils/fileProxy');

const router = express.Router();

router.get('/:studyMaterialId', optionalAuth, async (req, res, next) => {
    try {
        const material = get(
            `SELECT *
             FROM study_materials
             WHERE id = ? AND deleted_at IS NULL`,
            [req.params.studyMaterialId]
        );

        if (!material || !material.file_path) {
            return next(new AppError('File not found', 404));
        }

        if (material.status !== 'approved' && req.user?.role !== 'admin') {
            return next(new AppError('You do not have permission to access this file', 403));
        }

        const filePath = resolveUploadPath(material.file_path);
        if (!filePath) {
            return next(new AppError('File not found', 404));
        }

        const streamed = await streamLocalFile(res, filePath, {
            contentType: material.mime_type || 'application/octet-stream',
            downloadName: material.original_filename,
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

module.exports = router;
