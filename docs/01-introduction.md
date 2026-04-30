# Introduction

## Product Name

**NMU Study Hub** is a web application for students, faculty, and administrators to manage and access academic study content in one place.

The product is designed around a common college problem: notes, syllabus PDFs, question papers, and reference material are usually scattered across WhatsApp groups, drives, classrooms, and individual devices. NMU Study Hub brings those materials into a single structured platform with authentication, search, uploads, and admin moderation.

## Product Purpose

The application helps students quickly find study material by branch, semester, subject, and content type. It also gives faculty and students a controlled way to contribute useful files, while administrators verify content before it becomes public.

In simple terms:

- Students use the platform to find syllabus and approved study content.
- Faculty can register, wait for admin approval, and contribute content.
- Admins manage users, faculty approvals, syllabus, resources, and uploaded study materials.

## Main Problems Solved

1. **Scattered academic resources**
   Study materials are often shared informally and become hard to find later.

2. **No verification of quality**
   Students may receive incomplete, duplicate, or wrong material. The admin approval process reduces this risk.

3. **Difficult syllabus access**
   Students need a quick way to search syllabus by course name, subject code, branch, and semester.

4. **Unclear ownership of uploaded content**
   Uploaded study materials store the author or credit name, so useful contributors are visible.

5. **Manual faculty validation**
   Faculty accounts require admin approval, which prevents unknown users from receiving faculty-level access.

## Current Product Modules

| Module | Purpose |
| --- | --- |
| Home | Entry point for students to understand and navigate the platform. |
| Authentication | Student/faculty signup, OTP verification, login, logout, refresh sessions, profile updates, and avatar uploads. |
| Study Materials | Branch/semester selection, subject demo content, approved community uploads, search, filters, and upload submission. |
| Syllabus | Public syllabus listing with search, branch filter, semester filter, and PDF/Markdown viewing. |
| Admin Dashboard | Overview of users, resources, new activity, approval queue, and quick admin actions. |
| Content Approval | Admin review workflow for uploaded study materials. |
| Resource Manager | Admin management of approved resource links such as PDFs, videos, docs, markdown, PYQs, lab manuals, and books. |
| Syllabus Manager | Admin creation and deletion of syllabus records, including PDF and Markdown syllabus uploads. |
| Student Manager | Admin list/search/delete for student accounts. |
| Faculty Manager | Admin approval/revocation workflow for faculty accounts. |
| Faculty Dashboard | Faculty-facing dashboard route for faculty users after login. |

## Important Implementation Note

The product currently has two types of educational content:

1. **Static demo subject content in the frontend**
   The React app contains sample subject/topic data in `app/src/data/study-data.ts`. This powers the branch, semester, subject, unit, topic, markdown notes, video placeholder, quiz, and question-paper style UI.

2. **Dynamic backend content**
   The backend stores users, syllabus records, admin resources, faculty subjects, OTPs, refresh tokens, jobs, and user-uploaded study materials in SQLite. Approved uploaded content appears publicly in the study-materials page.

This means the core product workflow is functional, but some subject/topic academic data is currently demo-seeded on the frontend rather than fully managed from the backend.

## Technology Summary

| Area           | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite                                       |
| Routing        | React Router                                                     |
| Styling        | Tailwind CSS 4, Radix/shadcn-style UI components                 |
| Backend        | Node.js, Express 5                                               |
| Database       | SQLite using Node's built-in `node:sqlite` `DatabaseSync`        |
| Authentication | JWT access tokens, refresh-token cookie, bcrypt password hashing |
| Validation     | Zod                                                              |
| File Uploads   | Multer local filesystem storage                                  |
| Caching        | Redis if configured, otherwise in-memory cache                   |
| Email/Jobs     | Nodemailer through a small database-backed job queue             |

## High-Level User Journey

1. A new student or faculty member creates an account.
2. The backend sends an OTP for email verification.
3. The user verifies the OTP and receives a login session.
4. Students can browse syllabus and approved study material.
5. Signed-in users can submit study content for admin review.
6. Admins approve or reject submitted content.
7. Approved content becomes visible to students on the public study-materials screen.

## Mentor Review Summary

NMU Study Hub is a student-resource platform with a working full-stack structure. It includes role-based authentication, email OTP verification, faculty approval, admin moderation, syllabus management, resource management, local file storage, and dynamic approved study-content publishing. The backend is REST-based and uses SQLite, while the frontend is a modern React application with a structured admin dashboard and student-facing browsing experience.
