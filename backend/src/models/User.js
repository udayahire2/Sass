const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    // OTP & Verification Fields
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        select: false // Don't return OTP in queries
    },
    otpExpires: {
        type: Date,
        select: false
    },
    // Optional Google fields (kept for backward compatibility or future use)
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'faculty'],
        default: 'student'
    },
    branch: {
        type: String,
        enum: ['Computer', 'IT', 'Civil', 'Mechanical', 'Electrical', 'ENTC'],
        required: function () { return this.role === 'student'; }
    },
    year: {
        type: String,
        enum: ['FE', 'SE', 'TE', 'BE'],
        required: function () { return this.role === 'student'; }
    },
    // Faculty Fields
    designation: {
        type: String,
        required: function () { return this.role === 'faculty'; }
    },
    department: {
        type: String,
        required: function () { return this.role === 'faculty'; }
    },
    subjects: {
        type: [String],
        required: function () { return this.role === 'faculty'; }
    },
    collegeName: {
        type: String,
        required: function () { return this.role === 'faculty'; }
    },
    isApproved: {
        type: Boolean,
        default: function () { return this.role !== 'faculty'; } // Students/Admins auto-approved, Faculty pending
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
