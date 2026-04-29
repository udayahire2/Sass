# Requirements

This document explains the functional and non-functional requirements implemented in the current codebase.

## Functional Requirements

### 1. Authentication and Account Management

The system must allow users to create and manage accounts.

Implemented features:

- Student signup with name, email, password, branch, and year.
- Faculty signup with name, email, password, designation, department, college name, and subjects.
- Email OTP generation and verification.
- Password hashing with bcrypt.
- Login with email and password.
- JWT access-token generation.
- Refresh-token session support through an HTTP-only cookie.
- Logout with refresh-token family revocation.
- Current-user lookup through `GET /api/v1/auth/me`.
- Profile update for authenticated users.
- Avatar upload for authenticated users.

### 2. Student Study Material Browsing

The system must help students find study material quickly.

Implemented features:

- `/resources` page starts with branch and semester selection.
- Branch and semester routes are supported through React Router.
- Subject dashboard and topic viewer are available for static demo content.
- Approved user uploads are fetched dynamically from the backend.
- Approved uploads can be searched by title, subject, or author.
- Approved uploads can be filtered by material type.
- Uploaded files can be opened from their static file URL.

Current limitation:

- Subject/unit/topic data in `app/src/data/study-data.ts` is static demo data, not yet fully stored in the backend database.

### 3. Study Content Upload and Approval

The system must allow useful study content to be submitted and reviewed before publishing.

Implemented features:

- Signed-in users can upload study content.
- Faculty must be admin-approved before upload access is allowed.
- Supported uploaded file extensions are `.pdf`, `.ppt`, `.pptx`, `.docx`, and `.md`.
- Maximum study-material file size is 50 MB.
- Uploaded material is stored with status `pending`.
- Admins can view pending uploads.
- Admins can approve or reject uploaded material.
- Approved content becomes publicly visible through `GET /api/v1/study-materials/approved`.
- Rejected content is kept in review history but not publicly shown.

### 4. Syllabus Management

The system must provide searchable syllabus information.

Implemented public features:

- List syllabus records.
- Search by course title or subject code.
- Filter by branch.
- Filter by semester.
- View Markdown syllabus content in-app.
- Open PDF syllabus files.

Implemented admin features:

- Add a syllabus entry.
- Upload a syllabus file.
- Supported syllabus upload types: PDF, Markdown, and text.
- Maximum syllabus file size is 20 MB.
- Delete syllabus entries through soft delete.
- Automatically ensure a matching subject record exists when syllabus is created.

### 5. Resource Management

The system must allow admins to maintain official resource links.

Implemented features:

- Admin can create resources.
- Admin can delete resources.
- Public users can view approved resources.
- Admin users can view resources with status filtering.
- Resources include title, subject, semester, branch, type, description, category, pattern, unit, academic year, author, and URL.
- Supported resource types: `pdf`, `video`, `doc`, `markdown`.
- Supported categories: `Notes`, `PYQ`, `Syllabus`, `Lab Manual`, `Reference Book`, `Other`.

Important distinction:

- Admin resources are URL-based records.
- Study-material uploads are file-or-URL submissions that go through approval.

### 6. Admin Dashboard

The system must give admins a central management area.

Implemented features:

- Dashboard statistics:
  - Total users
  - Total resources plus study materials
  - New users in the last 7 days
  - New resources/materials in the last 7 days
- Content approval summary.
- Pending/approved material view.
- Student management navigation.
- Settings/profile navigation.
- Theme switching in the admin UI.

### 7. Student Management

The system must allow admins to review student accounts.

Implemented features:

- List students.
- Search students by name or email.
- Show branch, year, role, verification status, avatar, and join date.
- Soft-delete student accounts.

### 8. Faculty Management

The system must allow admins to control faculty access.

Implemented features:

- List pending faculty.
- List all faculty.
- Show designation, department, college name, and subjects.
- Approve faculty.
- Revoke faculty approval.
- Queue email notifications for faculty approval changes.

## Non-Functional Requirements

### Security

- Passwords must never be stored in plain text.
- Access tokens must be signed with a server-side secret.
- Refresh tokens must be hashed before database storage.
- Protected APIs must reject missing or invalid tokens.
- Admin APIs must require the `admin` role.
- Inputs must be validated with Zod.
- HTTP security headers are applied through Helmet.
- CORS is restricted to configured origins.
- Uploaded file types are restricted by extension.

### Reliability

- SQLite foreign keys are enabled.
- SQLite uses WAL journal mode for better local concurrency.
- Soft deletes are used for users, resources, syllabus, and study materials.
- Email sending is queued in a `jobs` table rather than blocking registration.
- Failed jobs can retry up to the configured attempt count.

### Performance

- Admin stats are cached for 60 seconds.
- Cache uses Redis when `REDIS_URL` is configured.
- If Redis is not available, the backend falls back to in-memory cache.
- Database indexes exist for common filters such as role, email, branch, semester, status, and created date.

### Maintainability

- Backend routes are grouped by domain: auth, admin, resources, study materials, and syllabus.
- Controllers and services separate HTTP logic from database helpers.
- Validation schemas are centralized in `backend/src/validation/schemas.js`.
- Frontend API helpers are centralized in `app/src/services/api.ts`.

## Current Gaps and Future Improvements

- Move static subject/unit/topic content from frontend demo data into backend tables.
- Add full CRUD for subjects and topic content.
- Add a proper faculty dashboard implementation beyond the route shell.
- Add pagination support on more frontend screens where backend query schemas already support page/limit.
- Add automated tests for authentication, upload validation, and admin approval workflows.
- Add cloud file storage for production deployments, because local uploads are not ideal for serverless hosting.
