const express = require('express');
const router = express.Router();
const QuestionOccurrence = require('../models/QuestionOccurrence');

// POST /api/exam-intelligence/tag - Create a new question topic occurrence tag
router.post('/tag', async (req, res) => {
    try {
        const { subject, topic, year, examType, marks, paperId, questionNumber } = req.body;

        if (!subject || !topic || !year) {
            return res.status(400).json({ message: 'Subject, topic, and year are required' });
        }

        const occurrence = new QuestionOccurrence({
            subject,
            topic,
            year: Number(year),
            examType: examType || 'End Sem',
            marks: Number(marks) || 0,
            paperId: paperId || null,
            questionNumber: questionNumber || '',
        });

        const saved = await occurrence.save();
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/exam-intelligence/subject/:subject - Get aggregated topic frequency stats for a subject
router.get('/subject/:subject', async (req, res) => {
    try {
        const subjectParam = req.params.subject;

        // Fetch all occurrences for this subject
        const occurrences = await QuestionOccurrence.find({
            subject: { $regex: new RegExp(`^${subjectParam}$`, 'i') }
        });

        if (!occurrences || occurrences.length === 0) {
            return res.json({
                success: true,
                subject: subjectParam,
                totalPapersAnalyzed: 0,
                topics: []
            });
        }

        // Calculate unique years analyzed
        const uniqueYears = [...new Set(occurrences.map(o => o.year))];
        const totalPapersAnalyzed = Math.max(uniqueYears.length, 1);

        // Group by topic
        const topicMap = {};

        occurrences.forEach(item => {
            const normalizedTopic = item.topic.trim();
            if (!topicMap[normalizedTopic]) {
                topicMap[normalizedTopic] = {
                    topic: normalizedTopic,
                    occurrencesCount: 0,
                    yearsAppeared: new Set(),
                    totalMarks: 0,
                    sampleQuestions: [],
                };
            }

            topicMap[normalizedTopic].occurrencesCount += 1;
            topicMap[normalizedTopic].yearsAppeared.add(item.year);
            topicMap[normalizedTopic].totalMarks += item.marks || 0;
            if (item.questionNumber && topicMap[normalizedTopic].sampleQuestions.length < 3) {
                topicMap[normalizedTopic].sampleQuestions.push(`${item.year} ${item.examType}: ${item.questionNumber} (${item.marks} marks)`);
            }
        });

        const topics = Object.values(topicMap).map(t => {
            const yearsCount = t.yearsAppeared.size;
            const frequencyPercent = Math.round((yearsCount / totalPapersAnalyzed) * 100);
            const avgMarks = Math.round((t.totalMarks / yearsCount) * 10) / 10;

            let priority = 'regular';
            if (frequencyPercent >= 60 || avgMarks >= 6) {
                priority = 'high';
            } else if (frequencyPercent >= 30 || avgMarks >= 4) {
                priority = 'medium';
            }

            return {
                topic: t.topic,
                occurrencesCount: t.occurrencesCount,
                yearsCount,
                totalMarks: t.totalMarks,
                avgMarks,
                frequencyPercent,
                priority,
                yearsList: Array.from(t.yearsAppeared).sort((a, b) => b - a),
                sampleQuestions: t.sampleQuestions
            };
        });

        // Sort by priority (high > medium > regular) then frequencyPercent descending
        const priorityScore = { high: 3, medium: 2, regular: 1 };
        topics.sort((a, b) => {
            if (priorityScore[b.priority] !== priorityScore[a.priority]) {
                return priorityScore[b.priority] - priorityScore[a.priority];
            }
            return b.frequencyPercent - a.frequencyPercent;
        });

        res.json({
            success: true,
            subject: subjectParam,
            totalPapersAnalyzed,
            yearsAnalyzed: uniqueYears.sort((a, b) => b - a),
            topics
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/exam-intelligence/paper/:paperId - Get tags for a specific question paper
router.get('/paper/:paperId', async (req, res) => {
    try {
        const tags = await QuestionOccurrence.find({ paperId: req.params.paperId }).sort({ createdAt: -1 });
        res.json({ success: true, data: tags });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/exam-intelligence/tag/:id - Delete tag
router.delete('/tag/:id', async (req, res) => {
    try {
        await QuestionOccurrence.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Tag removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
