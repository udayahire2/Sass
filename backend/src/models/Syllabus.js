const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Please add a subject code'],
        unique: true,
        trim: true
    },
    branch: {
        type: String,
        required: [true, 'Please add a branch'],
        enum: ['Computer', 'IT', 'Civil', 'Mechanical', 'Electrical', 'ENTC', 'Both']
    },
    semester: {
        type: String,
        default: ''
    },
    year: {
        type: String,
        enum: ['1', '2', '3', '4'],
        required: false
    },
    type: {
        type: String,
        enum: ['pdf', 'markdown'],
        default: 'pdf'
    },
    credits: {
        type: Number,
        required: [true, 'Please add credits']
    },
    contentUrl: {
        type: String,
        required: [true, 'Please add a content URL']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
