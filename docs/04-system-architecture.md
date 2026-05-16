# System Architecture

NMU Study Hub follows a client-server architecture:

- The frontend is a React single-page application in `app/`.
- The backend is an Express REST API in `backend/`.
- The active database is SQLite.
- Uploaded study files, syllabus files, and avatars are stored on the backend filesystem.
- File access for study materials and syllabus PDFs is handled through API proxy routes.

## Repository Structure

| Path | Purpose |
| --- | --- |
| `app/` | Main React/Vite frontend application. |
| `app/src` | Routes, pages, components, hooks, services, styles, and seeded study data source. |
| `backend/` | Main Express API backend. |
| `backend/src` | Active backend app, routes, controllers, services, middleware, config, and utilities. |
| `backend/migrations/` | SQLite schema migrations. |
| `backend/src/seeds/seedSubjects.js` | Imports `app/src/data/study-data.ts` into SQLite subjects, units, and topics. |
| `backend/uploads/` | Runtime folder for study-material uploads. |
| `backend/uploads/syllabus/` | Runtime folder for syllabus PDF files. |
| `backend/uploads/avatars/` | Runtime folder for avatar uploads. |
| `docs/` | Product and technical documentation. |

Legacy note:

- `app/backend/` is an older MongoDB backend and is not the active API.
- `backend/src/models/*.js` are legacy Mongoose model files. Current data access uses SQLite helpers in `backend/src/services/dbService.js`.

## Frontend Architecture

### Technology

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Radix/shadcn-style UI components
- Lucide icons
- Sonner toasts
- React Hook Form and Zod on several forms

### Frontend Entry Points

| File | Purpose |
| --- | --- |
| `app/src/main.tsx` | Creates the React root, installs `ThemeProvider`, and renders `RouterProvider`. |
| `app/src/router.tsx` | Defines all client routes. |
| `app/src/App.tsx` | Currently unused/inert because routing is handled directly from `main.tsx`. |
| `app/src/index.css` | Tailwind and global styles. |

### Main Frontend Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `HomePage` | Public home screen. Wrapped in `RoleGuard` for admin/faculty redirects. |
| `/login` | `LoginPage` | User login. |
| `/signup` | `SignUpPage` | Student/faculty registration. |
| `/verify-otp` | `VerifyOtpPage` | Email OTP verification. |
| `/resources` | `StudyMaterialsPage` | Branch/semester selector plus approved community uploads. |
| `/resources/:branch/:semester` | `StudyMaterialsPage` | Subject list for selected branch and semester. |
| `/resources/:branch/:semester/:subjectId` | `StudyMaterialsPage` | Subject dashboard with units/topics. |
| `/resources/:branch/:semester/:subjectId/topic/:topicId` | `StudyMaterialsPage` | Topic viewer. |
| `/syllabus` | `SyllabusPage` | Public syllabus search and viewing. |
| `/add-study-content` | `AddStudyContentPage` | Upload study material for review. |
| `/profile` | `ProfilePage` | Profile, avatar, personal uploads, upload form, and bookmarks. |
| `/search` | `SearchPage` | Global search over syllabus and approved uploads. |
| `/feedback` | `FeedbackPage` | Submit platform feedback (bug reports, feature requests). |
| `/how-to-use` | `HowToUsePage` | User guide and instructions. |
| `/dashboard/faculty` | `FacultyDashboard` | Faculty status, stats, uploads, and feedback. |
| `/dashboard/faculty/upload` | `FacultyAddMaterial` | Faculty upload study materials. |
| `/dashboard/faculty/profile` | `FacultyProfile` | Faculty profile management. |
| `/admin` and `/admin/dashboard` | `DashboardPage` | Admin overview and statistics. |
| `/admin/syllabus` | `SyllabusManagerPage` | Admin syllabus upload/delete. |
| `/admin/resources` | `ResourceManagerPage` | Admin resource create/delete UI. |
| `/admin/students` | `StudentsPage` | Admin student management. |
| `/admin/approvals` | `ContentApprovalPage` | Admin content moderation. |
| `/admin/faculty` | `FacultyManager` | Admin faculty approval and revocation. |
| `/admin/feedback` | `FeedbackManagerPage` | Admin platform feedback review and management. |

There is a `SettingsPage.tsx` file, but no `/admin/settings` route is registered in the current router.

### Frontend API Layer

| File | Responsibility |
| --- | --- |
| `app/src/services/api.ts` | API base URL, asset URL construction, auth headers, response parsing, error messages, and academic content calls. |
| `app/src/services/study-service.ts` | Approved/pending/rejected/my study materials, upload, status update, bookmarks. |
| `app/src/services/syllabus-service.ts` | Fetch, create, and delete syllabus records. |
| `app/src/services/resource-service.ts` | Fetch, create, and delete resources. |
| `app/src/services/admin-service.ts` | Dashboard stats and admin profile calls. |
| `app/src/services/faculty-service.ts` | Faculty stats and material feedback calls. |

The frontend uses `VITE_API_URL` when configured. Otherwise it defaults to `/api/v1`.

## Backend Architecture

### Technology

- Node.js
- Express 5
- SQLite through `node:sqlite`
- Zod validation
- JWT authentication
- bcrypt password hashing
- Multer uploads
- Helmet security headers
- CORS
- Optional Redis cache
- Nodemailer helper with fallback logging

### Backend Entry Points

| File | Purpose |
| --- | --- |
| `backend/src/server.js` | Local server startup. Runs migrations, ensures default admin, connects cache, then listens. |
| `backend/src/app.js` | Express app composition: middleware, static avatar serving, routes, error handlers. |
| `backend/api/index.js` | Serverless-style entry point that exports the Express app. |

### Middleware Pipeline

1. Disable `x-powered-by`.
2. Parse JSON request bodies with configured size limit.
3. Parse URL-encoded form bodies with configured size limit.
4. Apply CORS rules from `CORS_ORIGINS`.
5. Apply Helmet.
6. Serve avatar files from `/uploads/avatars`.
7. Apply Morgan request logging in development.
8. Mount all API routes at `/api/v1`.
9. Apply 404 handler.
10. Apply global error handler.

Study-material and syllabus files are not broadly served by `express.static`; they are streamed through `/api/v1/files/:studyMaterialId` and `/api/v1/syllabus/:id/file`.

## Backend Route Groups

| Base route | File | Purpose |
| --- | --- | --- |
| `/api/v1/auth` | `authRoutes.js` | Registration, login, OTP, sessions, profile, avatar. |
| `/api/v1/admin` | `adminRoutes.js` | Admin stats, profile, users, faculty management. |
| `/api/v1/resources` | `resourceRoutes.js` | Admin-managed resource links and file uploads. |
| `/api/v1/study-materials` | `studyMaterialRoutes.js` | Uploads, moderation, bookmarks, faculty stats, feedback. |
| `/api/v1/syllabus` | `syllabusRoutes.js` | Public syllabus list, admin create/delete, file streaming. |
| `/api/v1/files` | `fileRoutes.js` | Study-material file proxy. |
| `/api/v1/feedback` | `platformFeedbackRoutes.js` | Platform feedback submission, listing, and management. |
| `/api/v1/subjects` | `subjectRoutes.js` | Subject list by branch/semester. |
| `/api/v1/subjects/:id/units` | `subjectRoutes.js` | Units with nested topics. |
| `/api/v1/topics/:id` | `subjectRoutes.js` | Single topic with Markdown and subject metadata. |
| `/api/v1/health` | `routes/index.js` | Health check. |

## Database Architecture

The backend uses SQLite migrations in `backend/migrations`.

Default database path:

```text
backend/data/studyhub.sqlite
```

This can be overridden with `DB_PATH`.

SQLite startup settings:

- Foreign keys enabled
- WAL journal mode
- Normal synchronous mode
- 5000 ms busy timeout

## Core Data Flows

### Login Flow

1. User submits email and password.
2. Frontend calls `POST /api/v1/auth/login`.
3. Backend validates the request with Zod.
4. Backend finds the user by email and compares the password with bcrypt.
5. Backend blocks unverified accounts and creates a fresh OTP.
6. Backend signs an access token and creates a refresh token.
7. Backend stores the refresh-token hash and sets the raw refresh token as an HTTP-only cookie.
8. Frontend stores access token and user object in `localStorage`.
9. Frontend redirects by role.

### Academic Browsing Flow

1. User opens `/resources`.
2. User selects branch and semester.
3. Frontend calls `GET /api/v1/subjects?branch=...&semester=...`.
4. User opens a subject.
5. Frontend calls `GET /api/v1/subjects/:id/units`.
6. User opens a topic.
7. Frontend calls `GET /api/v1/topics/:id` and renders Markdown content.

### Study Upload Flow

1. Signed-in user opens `/add-study-content` or profile upload form.
2. Frontend sends `multipart/form-data` to `POST /api/v1/study-materials`.
3. Backend authenticates the user.
4. Backend blocks unapproved faculty.
5. Multer stores the file in `backend/uploads/`.
6. Backend inserts a `pending` row into `study_materials`.
7. Admin reviews the row from `/admin/approvals`.
8. Admin approves or rejects the material.
9. Approved materials appear in `/resources`, `/search`, and bookmark flows.

### File Preview Flow

1. Frontend builds an asset URL with `buildAssetUrl()`.
2. Study-material files use `/api/v1/files/:studyMaterialId`.
3. Syllabus PDF files use `/api/v1/syllabus/:id/file`.
4. Backend verifies record status and streams the local file.
5. Admin preview uses `fetchAssetBlobUrl()` to load a blob URL for iframe preview.

### Syllabus Flow

1. Admin uploads a syllabus from `/admin/syllabus`.
2. Backend receives `multipart/form-data`.
3. PDF files are stored in `backend/uploads/syllabus/`; Markdown/text files are read and stored as content.
4. Backend ensures a matching subject row.
5. Backend inserts a row into `syllabi`.
6. Public users search and view syllabus from `/syllabus`.

## Deployment Considerations

- The backend contains a Vercel-style entry point, but local filesystem uploads are risky on serverless platforms because files may not persist.
- Production should move uploaded files to object storage such as S3, Cloudinary, Supabase Storage, or equivalent.
- Redis is optional. Without it, cache state is per-process memory only.
- SMTP variables are required for real email delivery. Without SMTP and without a running job worker, email jobs are not delivered, though OTPs are printed to server logs in development.
