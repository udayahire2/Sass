const express = require('express');
const router = express.Router();
const resourceRoutes = require('./resourceRoutes');
const authRoutes = require('./authRoutes');
const fileRoutes = require('./fileRoutes');
const contentRoutes = require('./contentRoutes');

const adminRoutes = require('./adminRoutes');
const studyMaterialRoutes = require('./studyMaterialRoutes');
const syllabusRoutes = require('./syllabusRoutes');
const subjectRoutes = require('./subjectRoutes');
const platformFeedbackRoutes = require('./platformFeedbackRoutes');
const notesRoutes = require('./notesRoutes');

router.use('/resources', resourceRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/content', contentRoutes);
router.use('/files', fileRoutes);
router.use('/study-materials', studyMaterialRoutes);
router.use('/syllabus', syllabusRoutes);
router.use('/notes', notesRoutes);
router.use('/', subjectRoutes);
router.use('/feedback', platformFeedbackRoutes);

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
