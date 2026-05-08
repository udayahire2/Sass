const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['study_stock', 'imp_questions', 'lecture_notes', 'practice_quizzes'],
        required: true,
    },
    uploader_role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        required: true,
    },
    uploader_name: {
        type: String,
        required: true,
        trim: true,
    },
    uploader_user_id: {
        type: String,
    },
    file_url: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Content', contentSchema);

