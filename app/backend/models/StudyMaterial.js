const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['PDF', 'PPT', 'DOCX', 'Markdown', 'Video', 'Notes'],
        required: true,
    },
    // For external links (e.g. YouTube)
    url: {
        type: String,
    },
    // For uploaded files (local path)
    filePath: {
        type: String,
    },
    originalFilename: {
        type: String,
    },
    mimeType: {
        type: String,
    },
    fileSize: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    author: {
        type: String,
        default: 'Anonymous',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
