const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // Needed for explicit hashing if not relying on pre-save hook for bulk insert
const Resource = require('./models/Resource');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
    },
    {
        name: 'John Student',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
        branch: 'Computer',
        year: 'SE'
    }
];

const resources = [
    {
        title: 'Data Structures & Algorithms - Unit 1',
        subject: 'DSA',
        type: 'pdf',
        description: 'Comprehensive notes on Arrays, Linked Lists, and basic complexity analysis.',
        author: 'Prof. A. K. Sharma',
        semester: 'Sem 3',
        branch: 'Computer',
        url: '#',
        date: '2025-01-15',
        category: 'Notes',
        pattern: '2019',
        unit: '1',
        year: 'SE',
        isRecommended: true,
        status: 'approved' // Admin approved
    },
    {
        title: 'React Hooks Explained',
        subject: 'Web Development',
        type: 'video',
        description: 'Deep dive into useState, useEffect, and custom hooks with practical examples.',
        author: 'Code With Harry',
        semester: 'Sem 5',
        branch: 'Computer',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        date: '2025-01-20',
        category: 'Reference Book',
        pattern: '2019',
        unit: '3',
        year: 'TE',
        isRecommended: true,
        downloads: 120,
        status: 'approved'
    },
    {
        title: 'Operating Systems - Process Scheduling',
        subject: 'OS',
        type: 'markdown',
        description: 'Quick revision notes on FCFS, SJF, and Round Robin algorithms.',
        author: 'Student Committee',
        semester: 'Sem 4',
        branch: 'Computer',
        url: '#',
        date: '2025-01-10',
        category: 'Notes',
        pattern: '2019',
        unit: '2',
        year: 'SE',
        status: 'pending' // Student upload pending approval
    },
    {
        title: 'Database Management Systems - Lab Manual',
        subject: 'DBMS',
        type: 'doc',
        description: 'Official lab manual for SQL queries and normalization exercises.',
        author: 'University Dept',
        semester: 'Sem 4',
        branch: 'Computer',
        url: '#',
        date: '2024-12-05',
        category: 'Lab Manual',
        pattern: '2019',
        unit: 'All',
        year: 'SE',
        status: 'approved'
    },
    {
        title: 'Graph Theory Basics',
        subject: 'DSA',
        type: 'pdf',
        description: 'Introduction to Graphs, BFS, DFS, and Shortest Path algorithms.',
        author: 'Prof. Mehta',
        semester: 'Sem 3',
        branch: 'Computer',
        url: '#',
        date: '2025-01-18',
        category: 'Notes',
        pattern: '2019',
        unit: '5',
        year: 'SE',
        status: 'pending'
    },
    {
        title: 'Next.js 14 Crash Course',
        subject: 'Web Development',
        type: 'video',
        description: 'Learn App Router, Server Actions, and new features in Next.js 14.',
        author: 'Traversy Media',
        semester: 'Sem 5',
        branch: 'Computer',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        date: '2025-01-22',
        category: 'Reference Book',
        pattern: '2019',
        unit: 'All',
        year: 'TE',
        downloads: 50,
        status: 'approved'
    },
    {
        title: 'Fluid Mechanics - Basics',
        subject: 'Fluid Mechanics',
        type: 'pdf',
        description: 'Introduction to fluid properties and statics.',
        author: 'Civil Dept',
        semester: 'Sem 3',
        branch: 'Civil',
        url: '#',
        date: '2025-01-12',
        category: 'Notes',
        pattern: '2019',
        unit: '1',
        year: 'SE',
        status: 'approved'
    },
    {
        title: 'Strength of Materials - Stress/Strain',
        subject: 'SOM',
        type: 'video',
        description: 'Video lecture on stress-strain curves for ductile materials.',
        author: 'NPTEL',
        semester: 'Sem 3',
        branch: 'Civil',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        date: '2024-11-20',
        category: 'Reference Book',
        pattern: '2019',
        unit: '2',
        year: 'SE',
        status: 'rejected' // Example of rejected
    }
];

const importData = async () => {
    try {
        await User.deleteMany();
        await Resource.deleteMany();

        // Create Users manually to handle hashing if pre-save hook doesn't trigger on insertMany properly or for control
        // Note: pre-save hook works on .create() or .save(), but insertMany might bypass middleware depending on config.
        // Let's use create or manual loop.

        // Hashing passwords manually for seed script to ensure it works
        const salt = await bcrypt.genSalt(10);
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123', // Will be hashed by pre-save
            role: 'admin'
        });

        const studentUser = await User.create({
            name: 'John Student',
            email: 'john@example.com',
            password: 'password123', // Will be hashed by pre-save
            role: 'student',
            branch: 'Computer',
            year: 'SE'
        });

        console.log('Users Imported...');

        // Link resources to users
        const adminId = adminUser._id;
        const studentId = studentUser._id;

        const sampleResources = resources.map((resource, index) => {
            // Assign some to admin, some to student
            // Even index -> Admin (Approved usually)
            // Odd index -> Student (Pending usually)
            return {
                ...resource,
                uploadedBy: index % 2 === 0 ? adminId : studentId,
                status: index % 2 === 0 ? 'approved' : resource.status // Ensure admin uploads are approved
            };
        });

        await Resource.create(sampleResources);
        console.log('Resources Imported...');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importData();
