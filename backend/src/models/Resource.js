const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    semester: {
        type: String,
        required: [true, 'Please add a semester']
    },
    branch: {
        type: String,
        required: [true, 'Please add a branch']
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'doc', 'markdown'],
        required: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    category: {
        type: String,
        enum: ['Notes', 'PYQ', 'Syllabus', 'Lab Manual', 'Reference Book', 'Other'],
        required: [true, 'Please select a category']
    },
    pattern: {
        type: String,
        default: '2019'
    },
    unit: {
        type: String,
        default: 'All'
    },
    year: {
        type: String,
        enum: ['FE', 'SE', 'TE', 'BE'],
        required: [true, 'Please select a year']
    },
    downloads: {
        type: Number,
        default: 0
    },
    isRecommended: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for initial seeding or legacy data
    },
    author: {
        type: String,
        required: [true, 'Please add an author']
    },
    date: {
        type: Date,
        default: Date.now
    },
    url: {
        type: String,
        required: [true, 'Please add a URL or ID']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
