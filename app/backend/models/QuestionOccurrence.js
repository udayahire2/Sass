const mongoose = require('mongoose');

const questionOccurrenceSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    topic: {
        type: String,
        required: true,
        trim: true,
    },
    year: {
        type: Number,
        required: true,
    },
    examType: {
        type: String,
        enum: ['End Sem', 'Mid Sem', 'Re-Exam'],
        default: 'End Sem',
    },
    marks: {
        type: Number,
        default: 0,
    },
    paperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyMaterial',
        required: false,
    },
    questionNumber: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

questionOccurrenceSchema.index({ subject: 1, topic: 1 });
questionOccurrenceSchema.index({ subject: 1, year: 1 });

module.exports = mongoose.model('QuestionOccurrence', questionOccurrenceSchema);
