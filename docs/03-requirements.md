# Requirements

This document describes requirements that are implemented in the current codebase.

## Functional Requirements

### 1. Authentication and Account Management

Implemented:

- Student signup with name, email, password, branch, and year.
- Faculty signup with name, email, password, designation, department, college name, and subjects.
- Email OTP generation, hashing, expiry, and verification.
- Password hashing with bcrypt.
- Login with email/password.
- JWT access-token generation.
- Rotating refresh-token sessions through an HTTP-only cookie.
- Logout with refresh-token family revocation.
- Current-user lookup through `GET /api/v1/auth/me`.
- Profile update for name, branch, and year.
- Avatar upload with client-side cropping in the profile page and backend image storage.

### 2. Academic Content Browsing

Implemented:

- `/resources` starts with branch and semester selection.
- `/resources/:branch/:semester` loads subjects from `GET /api/v1/subjects`.
- `/resources/:branch/:semester/:subjectId` loads units and topics from `GET /api/v1/subjects/:id/units`.
- `/resources/:branch/:semester/:subjectId/topic/:topicId` loads an individual topic from `GET /api/v1/topics/:id`.
- Topic records include Markdown content and optional YouTube video URLs.
- Subject data is seeded into SQLite from `app/src/data/study-data.ts` by `backend/src/seeds/seedSubjects.js`.

Requirement caveat:

- The UI can browse seeded content, but there is no admin CRUD UI yet for subjects, units, and topics.

### 3. Approved Upload Browsing and Bookmarks

Implemented:

- Approved user uploads are listed on `/resources`.
- Approved uploads can be searched by title, subject, or author.
- Approved uploads can be filtered by material type.
- Signed-in users can bookmark and unbookmark study materials.
- Bookmarked materials appear on the profile page.
- Local uploaded files open through `/api/v1/files/:studyMaterialId`.

### 4. Study Content Upload and Approval

Implemented:

- Signed-in users can upload study content from `/add-study-content` and `/profile`.
- Unapproved faculty are blocked by backend middleware.
- Supported uploaded file extensions are `.pdf`, `.ppt`, `.pptx`, `.docx`, and `.md`.
- Maximum study-material file size is 50 MB.
- Uploaded material is inserted with status `pending`.
- Admins can view pending, approved, and rejected uploads.
- Admins can preview files during review.
- Admins can approve or reject uploaded material.
- Approved content becomes publicly visible through `GET /api/v1/study-materials/approved`.
- Rejected content remains available to admin review history and user upload history, but is not public.

### 5. Syllabus Management

Public features:

- List syllabus records.
- Search by title or code.
- Filter by branch.
- Filter by semester.
- View Markdown syllabus content in-app.
- Open PDF syllabus files through `GET /api/v1/syllabus/:id/file`.

Admin features:

- Add a syllabus entry from `/admin/syllabus`.
- Upload PDF, Markdown, Markdown extension, or text files.
- Maximum syllabus file size is 20 MB.
- Store PDF files on disk and Markdown/text content in the database.
- Delete syllabus records through soft delete.
- Automatically ensure a matching `subjects` row exists when a syllabus record is created.

Current behavior:

- New syllabus rows store `credits = 0`; the current frontend and backend create schema do not collect credits.

### 6. Resource Management

Implemented:

- Admins can create, update, and delete resource URL records through the API.
- The current admin UI supports create and delete.
- Public users can view approved resources from the API.
- Admin-created resources default to `approved`.
- Resources include title, subject, semester, branch, type, description, category, pattern, unit, academic year, author, URL, and status.

Important distinction:

- Resources are URL records managed by admins.
- Study materials are user submissions that can be file uploads or URLs and go through moderation.

### 7. Search

Implemented:

- `/search` loads syllabus and approved materials.
- Query state is stored in the `q` URL parameter.
- Syllabus search matches title, code, and branch.
- Study-material search matches title, subject, and author.
- Syllabus results link back to `/syllabus?search=...`.
- Study-material results open external URLs or file-proxy URLs.

### 8. Admin Dashboard and Management

Implemented:

- Dashboard stats:
  - Total users
  - Total resources plus study materials
  - New users in the last 7 days
  - New resources/materials in the last 7 days
- Pending and approved material tables.
- Approval rate calculation in the frontend.
- Theme switching in the admin UI.
- Student search/list/delete.
- Faculty pending/all views with approve/revoke actions.
- Syllabus and resource management pages.

### 9. Faculty Dashboard and Feedback

Implemented:

- Faculty dashboard route at `/dashboard/faculty`.
- Fresh profile lookup through `GET /api/v1/auth/me`.
- Faculty stats from `GET /api/v1/study-materials/faculty/stats`.
- Personal upload list from `GET /api/v1/study-materials/my`.
- Approved material list for peer feedback.
- Feedback retrieval and upsert through `/study-materials/:id/feedback`.
- One feedback row per reviewer/material enforced by a database uniqueness constraint.

## Non-Functional Requirements

### Security

- Passwords are hashed with bcrypt.
- Access tokens and refresh tokens use server-side secrets.
- Refresh tokens are stored only as hashes.
- Protected APIs reject missing or invalid tokens.
- Admin APIs require the admin role.
- Inputs are validated with Zod.
- Helmet security headers are enabled.
- CORS is restricted to configured origins.
- Uploads are extension/MIME limited depending on the endpoint.
- File proxy endpoints prevent public access to non-approved study-material files unless the requester is admin.

### Reliability

- SQLite foreign keys are enabled.
- SQLite uses WAL mode and a busy timeout.
- Main tables use soft deletes where appropriate.
- Admin stats cache invalidates after content/resource changes.
- Email jobs are persisted in the `jobs` table.

Reliability caveat:

- The job queue worker exists in `backend/src/services/jobQueue.js`, but `backend/src/server.js` currently does not call `startJobWorker()`. Without a worker call, queued email jobs are recorded but not processed in the running server process. OTPs are still logged to the server console in development.

### Performance

- Admin stats are cached for 60 seconds.
- Redis is used when `REDIS_URL` is configured.
- In-memory cache is used as a fallback.
- Database indexes cover common lookups for users, subjects, syllabus, resources, study materials, refresh tokens, OTPs, jobs, feedback, and bookmarks.

### Maintainability

- Frontend service helpers are centralized under `app/src/services`.
- Backend route groups are organized by domain.
- Validation schemas are centralized in `backend/src/validation/schemas.js`.
- SQLite formatting helpers are centralized in `backend/src/services/dbService.js`.

## Current Gaps

- No admin UI for subject/unit/topic CRUD.
- No pagination applied in most frontend lists even where query validation accepts `page` and `limit`.
- Faculty dashboard is reachable by route, but backend middleware remains the primary protection for faculty-only actions.
- Local file storage is not ideal for serverless production.
- Automated tests are not yet present for the main auth, upload, approval, bookmark, and feedback flows.
