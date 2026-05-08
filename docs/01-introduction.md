# Introduction

## Product Name

**NMU Study Hub** is a web application for students, faculty, and administrators to find, submit, review, and manage academic study content.

The product addresses a common college workflow problem: syllabus files, unit notes, reference links, and peer-contributed material are usually scattered across chat groups, drives, classrooms, and personal devices. NMU Study Hub centralizes that material into a structured web experience with authentication, search, upload review, and role-based administration.

## Product Purpose

The current implementation helps users:

- Browse curriculum content by branch, semester, subject, unit, and topic.
- Search syllabus entries by title, code, branch, and semester.
- View approved study-material uploads and save bookmarks.
- Submit PDF, PPT, DOCX, or Markdown material for review.
- Let admins approve or reject uploaded content before it appears publicly.
- Let admins manage students, faculty access, syllabus records, and resource links.
- Let faculty track their uploads and leave feedback on approved materials.

## Main Problems Solved

1. **Scattered academic resources**
   Students can browse a single place for subjects, topics, syllabus, and approved shared content.

2. **Unverified shared files**
   User-uploaded files are stored as `pending` until an admin approves them.

3. **Slow syllabus discovery**
   The syllabus screen supports search, branch filters, semester filters, and in-app Markdown or file viewing.

4. **Unclear contribution ownership**
   Study materials store an author or credit name and show it in student, admin, and profile views.

5. **Uncontrolled faculty access**
   Faculty can register and verify email, but admin approval controls access to faculty contribution features.

## Current Product Modules

| Module | Current implementation |
| --- | --- |
| Home | Public landing screen with product navigation. Authenticated admins and faculty are redirected from `/` to their dashboards. |
| Authentication | Student/faculty signup, OTP verification, login, refresh sessions, logout, profile update, and avatar upload. |
| Study Materials | Branch/semester selection, API-driven subjects, units, topics, approved uploads, search, type filters, and bookmarks. |
| Syllabus | Public syllabus search with branch/semester filters and Markdown/PDF viewing. |
| Global Search | Searches loaded syllabus records and approved study materials from `/search`. |
| Upload Content | Signed-in users upload study files for admin review from `/add-study-content` or the profile page. |
| Profile | User details, avatar crop/upload, profile edits, personal uploads, upload form, and bookmarked materials. |
| Admin Dashboard | Stats, approval summary, material tables, quick links, and theme switching. |
| Content Approval | Admin moderation workflow with file preview through backend file proxy endpoints. |
| Resource Manager | Admin-created URL records for PDFs, videos, docs, Markdown, PYQs, lab manuals, and books. |
| Syllabus Manager | Admin upload and deletion of PDF or Markdown syllabus records. |
| Student Manager | Admin search/list/delete for student accounts. |
| Faculty Manager | Admin approval, revocation, and all-faculty visibility. |
| Faculty Dashboard | Faculty profile status, contribution stats, upload history, and feedback/rating tools. |

## Important Implementation Notes

The active frontend is `app/src`. The active backend is the top-level `backend/src` Express app.

Academic subject content is now API-driven:

- Source data lives in `app/src/data/study-data.ts`.
- `backend/src/seeds/seedSubjects.js` imports that data into SQLite.
- Frontend pages call `/api/v1/subjects`, `/api/v1/subjects/:id/units`, and `/api/v1/topics/:id`.

This means the student subject browser is no longer purely frontend mock data. It depends on seeded rows in the backend `subjects`, `units`, and `topics` tables.

Some older code remains in the repository:

- `app/backend/` is an older MongoDB/Express backend.
- `backend/src/models/*.js` are Mongoose-style legacy model files.

The current runtime path uses SQLite helpers in `backend/src/services/dbService.js`, not those legacy model files.

## Technology Summary

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Routing | React Router |
| Styling | Tailwind CSS 4, Radix/shadcn-style components, lucide-react |
| Backend | Node.js, Express 5 |
| Database | SQLite through Node `node:sqlite` `DatabaseSync` |
| Authentication | JWT access tokens, refresh-token cookie, bcrypt password hashing |
| Validation | Zod |
| File Uploads | Multer local filesystem storage plus file proxy streaming |
| Cache | Redis when configured, in-memory fallback otherwise |
| Email | Nodemailer fallback logging plus database-backed job records |

## High-Level User Journeys

### Student Journey

1. Student signs up with name, email, password, branch, and year.
2. Backend creates a 6-digit OTP and stores only its hash.
3. Student verifies OTP and receives a session.
4. Student browses `/resources`, chooses branch and semester, opens subjects, units, and topics.
5. Student views approved uploads, opens files, and bookmarks useful material.
6. Student can submit study content for admin review.
7. Student can manage profile details, avatar, personal uploads, and bookmarks from `/profile`.

### Faculty Journey

1. Faculty signs up with designation, department, college, and subjects.
2. Faculty verifies OTP and can log in.
3. Faculty lands on `/dashboard/faculty`.
4. Until admin approval, backend contribution routes block faculty upload actions.
5. Once approved, faculty can upload material and review approved materials with ratings/feedback.

### Admin Journey

1. Admin account is seeded from environment variables or scripts.
2. Admin logs in and lands on `/admin/dashboard`.
3. Admin reviews pending study material submissions.
4. Admin manages students, syllabus, resource links, and faculty approval.
5. Approved study materials become visible in public student-facing screens.
