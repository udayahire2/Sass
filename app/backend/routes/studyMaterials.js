const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const StudyMaterial = require('../models/StudyMaterial');

const FILE_TYPE_BY_EXTENSION = {
    '.pdf': 'PDF',
    '.ppt': 'PPT',
    '.pptx': 'PPT',
    '.docx': 'DOCX',
    '.md': 'Markdown',
};

function getFileType(originalName) {
    return FILE_TYPE_BY_EXTENSION[path.extname(originalName).toLowerCase()] || null;
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/');
        // Ensure directory exists or handle via fs (omitted for brevity, assuming folder created or auto-handled)
        // Actually, good practice to let user know to create folder or use fs.mkdirSync
        const fs = require('fs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (getFileType(file.originalname)) {
            cb(null, true);
            return;
        }

        cb(new Error('Only .pdf, .ppt, .pptx, .docx, and .md files can be uploaded'));
    },
});

// GET /api/materials/approved - Get all approved materials (Student View)
router.get('/approved', async (req, res) => {
    try {
        const materials = await StudyMaterial.find({ status: 'approved' }).sort({ createdAt: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/materials/pending - Get all pending materials (Admin View)
router.get('/pending', async (req, res) => {
    try {
        const materials = await StudyMaterial.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/materials/rejected - Get all rejected materials (Admin View)
router.get('/rejected', async (req, res) => {
    try {
        const materials = await StudyMaterial.find({ status: 'rejected' }).sort({ createdAt: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/materials - Upload/Create new material
// supports multipart/form-data for file uploads
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { title, subject, type, url, author } = req.body;

        let filePath = null;
        if (req.file) {
            // Store relative path for frontend access
            filePath = `/uploads/${req.file.filename}`;
        }

        const inferredType = req.file ? getFileType(req.file.originalname) : type;
        if (!inferredType) {
            return res.status(400).json({ message: 'A supported study file is required' });
        }

        if (type && type !== inferredType) {
            return res.status(400).json({ message: `Selected type does not match uploaded file. Expected ${inferredType}.` });
        }

        const newMaterial = new StudyMaterial({
            title,
            subject,
            type: inferredType,
            url: url || '', // Optional if file provided
            filePath: filePath,
            originalFilename: req.file?.originalname,
            mimeType: req.file?.mimetype,
            fileSize: req.file?.size,
            author: author || 'Student',
            status: 'pending' // Default status
        });

        const savedMaterial = await newMaterial.save();
        res.status(201).json(savedMaterial);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH /api/materials/:id/status - Approve or Reject material
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const material = await StudyMaterial.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        material.status = status;
        const updatedMaterial = await material.save();
        res.json(updatedMaterial);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
