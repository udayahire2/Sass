# Product Introduction

## Product Name

**NMU Study Hub** is a full-stack academic resource platform for students, faculty, and administrators. Its goal is to centralize syllabus, study material, topic notes, community uploads, bookmarks, feedback, and personal notes for NMU students.

## Launch Goal

The working launch goal is:

> NMU Study Hub ko real users tak successfully launch karna.

This means the product must move beyond a local/demo build and become reliable enough for students and faculty to use every day.

## Problem Statement

Students usually find academic content across scattered sources:

- WhatsApp and Telegram groups.
- Google Drive links.
- Old PDFs passed between seniors.
- Faculty shared classroom files.
- Personal notes and local devices.

This creates repeated problems:

- Students do not know which resource is latest or trusted.
- Faculty contribution is hard to review and organize.
- Admins cannot easily moderate uploaded content.
- Syllabus and topic content are disconnected from notes and uploads.
- Search and discovery are weak.

NMU Study Hub solves this by putting academic content into one structured and role-aware web application.

## Current Product Scope

The current implementation supports these major modules:

| Module | Current status | Primary users |
| --- | --- | --- |
| Home | Implemented public landing/home route with role redirects. | All users |
| Authentication | Implemented signup, login, OTP verification, refresh-token backend, profile update, avatar upload. | Students, faculty, admin |
| Academic browser | Implemented branch, semester, subject, unit, and topic browsing from SQLite seed data. | Students, faculty |
| Study Stock | Implemented approved upload discovery and bookmarking. | Students, faculty |
| Syllabus | Implemented public syllabus search/viewing and admin syllabus management. | Students, admin |
| Resource management | Implemented admin resource create/update/delete APIs and create/delete UI. | Admin |
| Study uploads | Implemented user upload flow with admin approval/rejection. | Students, faculty, admin |
| Admin dashboard | Implemented stats, moderation, users, faculty, syllabus, resources, and feedback screens. | Admin |
| Faculty dashboard | Implemented faculty profile/status, upload history, stats, and feedback on materials. | Faculty |
| Profile | Implemented profile editing, avatar crop/upload, uploads, bookmarks, and upload form. | Students, faculty |
| Notes | Implemented Notion-style notes workspace with metadata, sidebar, trash, favorites, covers, and editor themes. | Students |
| Platform feedback | Implemented feedback submission and admin management. | All users, admin |

## Current Product Architecture Summary

NMU Study Hub is a client-server application:

- Frontend: React 19, TypeScript, Vite, React Router, Tailwind CSS 4.
- Backend: Node.js, Express 5, Zod, JWT, Multer, Helmet, CORS.
- Database: SQLite through Node `node:sqlite` `DatabaseSync`.
- Cache: Redis when configured, in-memory fallback otherwise.
- Storage: local filesystem uploads under `backend/uploads`.
- Email: table-backed jobs plus Nodemailer delivery when SMTP is configured.

## Current User Journeys

### Student Journey

1. Student signs up with name, email, password, branch, and year.
2. Backend creates a hashed 6-digit OTP and queues an email job.
3. Student verifies OTP and receives an authenticated session.
4. Student opens `/resources`, selects branch and semester, and browses subjects.
5. Student opens units and topics with Markdown content.
6. Student opens `/study-stock` or `/resources` to find approved uploads.
7. Student bookmarks useful material.
8. Student can upload study content for admin review.
9. Student can manage profile, avatar, uploads, bookmarks, and notes.

### Faculty Journey

1. Faculty signs up with designation, department, college name, and subjects.
2. Faculty verifies OTP.
3. Faculty can log in and view `/dashboard/faculty`.
4. Until admin approval, contribution endpoints block upload actions.
5. Once approved, faculty can upload material and review approved material with ratings and feedback.

### Admin Journey

1. Admin account is seeded from environment variables or script.
2. Admin logs in and opens `/admin/dashboard`.
3. Admin reviews pending study material submissions.
4. Admin approves or rejects material.
5. Admin manages syllabus records, resources, students, faculty approval, and platform feedback.

## Product Strengths

- Clear separation between public content and admin moderation.
- Role-aware product shape for student, faculty, and admin needs.
- Useful academic information architecture: branch -> semester -> subject -> unit -> topic.
- Real database migrations exist.
- Upload and file metadata are captured.
- Notes module gives users a retention tool, not only a browsing tool.
- Refresh-token backend is more advanced than many early-stage student apps.

## Product Weaknesses Before Launch

- Production deployment design is not settled.
- Local uploads are not durable in serverless or multi-instance hosting.
- Access tokens are stored in `localStorage`.
- Critical flows lack automated tests.
- Search and pagination are not ready for large datasets.
- Some UI surfaces are incomplete or inconsistent.
- Legacy code remains in the repository and should be cleaned before launch.

See [09-improvement-plan.md](./09-improvement-plan.md) and [10-production-readiness-launch-plan.md](./10-production-readiness-launch-plan.md) for the complete audit and launch checklist.
