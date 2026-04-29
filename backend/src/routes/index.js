const express = require('express');
const router = express.Router();
const resourceRoutes = require('./resourceRoutes');
const authRoutes = require('./authRoutes');

const adminRoutes = require('./adminRoutes');
const studyMaterialRoutes = require('./studyMaterialRoutes');
const syllabusRoutes = require('./syllabusRoutes');

router.use('/resources', resourceRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/study-materials', studyMaterialRoutes);
router.use('/syllabus', syllabusRoutes);

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
