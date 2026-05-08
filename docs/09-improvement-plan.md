# Improvement Plan

This document captures the current implementation status and practical next steps.

## Recently Integrated Capabilities

### 1. API-Driven Academic Content

Implemented:

- `subjects`, `units`, and `topics` tables in SQLite.
- Seed script that imports `app/src/data/study-data.ts`.
- Public APIs:
  - `GET /api/v1/subjects`
  - `GET /api/v1/subjects/:id/units`
  - `GET /api/v1/topics/:id`
- Frontend integration in `StudyMaterialsPage`, `SubjectGrid`, `SubjectDashboard`, and `TopicViewer`.

Remaining gap:

- There is no admin UI for creating or editing subjects, units, or topics.

### 2. File Proxy System

Implemented:

- `backend/src/utils/fileProxy.js` for resolving and streaming local uploads.
- `GET /api/v1/files/:studyMaterialId` for study-material files.
- `GET /api/v1/syllabus/:id/file` for syllabus PDFs.
- Frontend `buildAssetUrl()` support for proxy URLs.
- Admin preview using authenticated blob fetches.

Remaining gap:

- Files are still stored locally, which is not ideal for serverless or horizontally scaled production.

### 3. Bookmarks

Implemented:

- `bookmarks` table.
- `GET /api/v1/study-materials/bookmarks`.
- `POST /api/v1/study-materials/:id/bookmark`.
- Bookmark buttons in approved uploads.
- Bookmarked content section on the profile page.

### 4. Faculty Dashboard and Feedback

Implemented:

- Faculty dashboard route.
- Faculty contribution stats endpoint.
- Personal upload status list.
- `material_feedback` table.
- Feedback list and feedback upsert endpoints.
- 1-5 star feedback UI.

Remaining gap:

- Faculty route access is mostly enforced by backend data calls and contribution middleware; a dedicated frontend faculty route guard would make the UI boundary clearer.

### 5. Profile and Avatar Experience

Implemented:

- Profile details edit.
- Avatar crop UI with `react-easy-crop`.
- Avatar upload endpoint.
- Default avatar component for users without uploaded avatars.
- Personal upload and bookmark panels.

## High-Priority Next Steps

### 1. Start or Replace the Job Worker

Current state:

- Registration and faculty approval enqueue `email.send` jobs.
- `jobQueue.js` contains a worker loop.
- `server.js` does not currently call `startJobWorker()`.

Recommended change:

- Start the worker during local server boot, or replace the table-backed queue with a production job runner.

### 2. Add Subject/Unit/Topic Admin Management

Current state:

- Student browsing is API-driven, but content management depends on a seed script.

Recommended change:

- Add admin CRUD for subjects.
- Add unit/topic CRUD under each subject.
- Support Markdown editing and video URL management.
- Keep seed script as import/bootstrap tooling.

### 3. Move File Storage to Object Storage

Current state:

- Files are stored under `backend/uploads`.

Recommended change:

- Use S3, Cloudinary, Supabase Storage, or another object store.
- Store object keys and metadata in SQLite.
- Use signed URLs or authenticated streaming for private/pending assets.

### 4. Strengthen Route Guards

Current state:

- Admin layout redirects based on local auth state and admin APIs enforce authorization.
- Faculty action protection is enforced by backend middleware.

Recommended change:

- Add explicit frontend guards for admin-only and faculty-only routes.
- Handle missing/expired access tokens through a refresh flow before redirecting.

### 5. Add Automated Tests

Recommended coverage:

- Registration and OTP verification.
- Login, refresh, logout.
- Admin-only access checks.
- Faculty approval checks.
- Study-material upload validation.
- Approval/rejection workflow.
- File proxy access rules.
- Bookmark toggling.
- Feedback upsert behavior.

## Medium-Priority Improvements

### Pagination and Filtering

Backend validation already accepts some pagination parameters, but many controllers and frontend screens return/render all records.

Recommended change:

- Add SQL `LIMIT/OFFSET` to resource and material listing endpoints.
- Surface pagination in admin tables and public listings.

### Syllabus Credits

Current state:

- `syllabi.credits` exists, but create flow stores `0`.

Recommended change:

- Add credits to frontend form validation and backend create schema, or remove the field from the UI/data model if it is not needed.

### Resource Manager Completeness

Current state:

- API supports resource updates.
- Admin UI supports create and delete, but not edit.

Recommended change:

- Add edit dialog and status controls for resources.

### Token Storage Hardening

Current state:

- Access tokens are stored in `localStorage`.

Recommended change:

- Keep access tokens in memory.
- Use refresh-cookie rotation to restore sessions.
- Add frontend refresh handling around 401 responses.

## Long-Term Improvements

- Cloud deployment setup with persistent storage.
- Full-text search across syllabus, topics, and material metadata.
- Content duplicate detection.
- Markdown editor/preview for topic and syllabus management.
- Analytics for most-viewed subjects and materials.
- Role-specific notification center.
- Moderation notes and rejection reason display for users.

The broader roadmap remains in the root [ROADMAP.md](../ROADMAP.md).
