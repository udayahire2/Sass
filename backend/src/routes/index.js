const express = require('express');
const router = express.Router();
const resourceRoutes = require('./resourceRoutes');
const authRoutes = require('./authRoutes');
const fileRoutes = require('./fileRoutes');

const adminRoutes = require('./adminRoutes');
const studyMaterialRoutes = require('./studyMaterialRoutes');
const syllabusRoutes = require('./syllabusRoutes');
const subjectRoutes = require('./subjectRoutes');

router.use('/resources', resourceRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/files', fileRoutes);
router.use('/study-materials', studyMaterialRoutes);
router.use('/syllabus', syllabusRoutes);
router.use('/', subjectRoutes);

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
