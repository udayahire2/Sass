export type ResourceType = 'pdf' | 'video' | 'doc' | 'markdown';

export interface Resource {
    id: string;
    title: string;
    subject: string;
    type: ResourceType;
    description: string;
    author: string;
    date: string;
    url: string; // URL for video/download or ID for routing
    semester: string;
    branch: string;
}

export const mockResources: Resource[] = [
    {
        id: '1',
        title: 'Data Structures & Algorithms - Unit 1',
        subject: 'DSA',
        type: 'pdf',
        description: 'Comprehensive notes on Arrays, Linked Lists, and basic complexity analysis.',
        author: 'Prof. A. K. Sharma',
        date: '2025-01-15',
        url: '#',
        semester: 'Sem 3',
        branch: 'Computer'
    },
    {
        id: '2',
        title: 'React Hooks Explained',
        subject: 'Web Development',
        type: 'video',
        description: 'Deep dive into useState, useEffect, and custom hooks with practical examples.',
        author: 'Code With Harry',
        date: '2025-01-20',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
        semester: 'Sem 5',
        branch: 'Computer'
    },
    {
        id: '3',
        title: 'Operating Systems - Process Scheduling',
        subject: 'OS',
        type: 'markdown',
        description: 'Quick revision notes on FCFS, SJF, and Round Robin algorithms.',
        author: 'Student Committee',
        date: '2025-01-10',
        url: '#',
        semester: 'Sem 4',
        branch: 'Computer'
    },
    {
        id: '4',
        title: 'Database Management Systems - Lab Manual',
        subject: 'DBMS',
        type: 'doc',
        description: 'Official lab manual for SQL queries and normalization exercises.',
        author: 'University Dept',
        date: '2024-12-05',
        url: '#',
        semester: 'Sem 4',
        branch: 'Computer'
    },
    {
        id: '5',
        title: 'Graph Theory Basics',
        subject: 'DSA',
        type: 'pdf',
        description: 'Introduction to Graphs, BFS, DFS, and Shortest Path algorithms.',
        author: 'Prof. Mehta',
        date: '2025-01-18',
        url: '#',
        semester: 'Sem 3',
        branch: 'Computer'
    },
    {
        id: '6',
        title: 'Next.js 14 Crash Course',
        subject: 'Web Development',
        type: 'video',
        description: 'Learn App Router, Server Actions, and new features in Next.js 14.',
        author: 'Traversy Media',
        date: '2025-01-22',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        semester: 'Sem 5',
        branch: 'Computer'
    },
    {
        id: '7',
        title: 'Fluid Mechanics - Basics',
        subject: 'Fluid Mechanics',
        type: 'pdf',
        description: 'Introduction to fluid properties and statics.',
        author: 'Civil Dept',
        date: '2025-01-12',
        url: '#',
        semester: 'Sem 3',
        branch: 'Civil'
    },
    {
        id: '8',
        title: 'Strength of Materials - Stress/Strain',
        subject: 'SOM',
        type: 'video',
        description: 'Video lecture on stress-strain curves for ductile materials.',
        author: 'NPTEL',
        date: '2024-11-20',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        semester: 'Sem 3',
        branch: 'Civil'
    }
];

export const branches = ['All', 'Computer', 'Civil', 'Information Technology', 'Mechanical', 'Electrical', 'Electronics'];
export const subjects = ['All', 'DSA', 'Web Development', 'OS', 'DBMS', 'Mathematics', 'Fluid Mechanics', 'SOM'];
export const semesters = ['All', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'];
