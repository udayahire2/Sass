# System Architecture

NMU Study Hub follows a client-server architecture:

- The **frontend** is a React single-page application.
- The **backend** is an Express REST API.
- The **database** is SQLite.
- Uploaded files are stored on the backend filesystem and served from `/uploads`.

## Repository Structure

| Path | Purpose |
| --- | --- |
| `app/` | Main React frontend application. |
| `backend/` | Main Express API backend. |
| `docs/` | Product and technical documentation. |
| `backend/migrations/` | SQLite schema migrations. |
| `backend/uploads/` | Local uploaded files, avatars, and syllabus files. |
| `backend/data/` | SQLite database files. |

Note: `app/backend/` appears to be an older or secondary backend folder. The main backend used by the current API is the top-level `backend/` folder.

## Frontend Architecture

### Technology

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Radix/shadcn-style components
- Lucide icons
- Sonner toast notifications

### Main Frontend Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `HomePage` | Public home screen. |
| `/login` | `LoginPage` | User login. |
| `/signup` | `SignUpPage` | Student/faculty registration. |
| `/verify-otp` | `VerifyOtpPage` | Email OTP verification. |
| `/resources` | `StudyMaterialsPage` | Branch/semester selection plus approved uploads. |
| `/resources/:branch/:semester` | `StudyMaterialsPage` | Subject list for branch and semester. |
| `/resources/:branch/:semester/:subjectId` | `StudyMaterialsPage` | Subject dashboard. |
| `/resources/:branch/:semester/:subjectId/topic/:topicId` | `StudyMaterialsPage` | Topic viewer. |
| `/syllabus` | `SyllabusPage` | Public syllabus search and viewing. |
| `/add-study-content` | `AddStudyContentPage` | Upload study content for review. |
| `/profile` | `ProfilePage` | User profile. |
| `/dashboard/faculty` | `FacultyDashboard` | Faculty dashboard route. |
| `/admin/dashboard` | `DashboardPage` | Admin overview. |
| `/admin/syllabus` | `SyllabusManagerPage` | Admin syllabus management. |
| `/admin/resources` | `ResourceManagerPage` | Admin resource management. |
| `/admin/students` | `StudentsPage` | Admin student management. |
| `/admin/approvals` | `ContentApprovalPage` | Admin content moderation. |
| `/admin/faculty` | `FacultyManager` | Admin faculty management. |
| `/admin/settings` | `SettingsPage` | Admin settings/profile area. |

### Frontend API Layer

The frontend uses fetch wrappers and helpers in `app/src/services/`.

| File | Responsibility |
| --- | --- |
| `api.ts` | Builds API URLs, asset URLs, auth headers, response parsing, and error messages. |
| `study-service.ts` | Fetch approved/pending/rejected/my uploads, upload material, update approval status. |
| `syllabus-service.ts` | Fetch, create, and delete syllabus records. |
| `resource-service.ts` | Fetch, create, and delete admin-managed resources. |
| `admin-service.ts` | Fetch dashboard stats and admin profile. |

The base API URL comes from `VITE_API_URL`. If it is not set, the frontend uses `/api/v1`.

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
- Nodemailer email sending

### Backend Entry Points

| File | Purpose |
| --- | --- |
| `backend/src/server.js` | Starts the HTTP server and background job worker. |
| `backend/src/app.js` | Creates the Express app, middleware, static file serving, routes, and error handlers. |
| `backend/api/index.js` | Serverless-style API entry point for deployment platforms. |

### Middleware Pipeline

1. Disable `x-powered-by`.
2. Parse JSON request bodies.
3. Parse URL encoded form bodies.
4. Apply CORS rules from environment config.
5. Apply Helmet security headers.
6. Serve `/uploads` statically.
7. Apply Morgan logging in development.
8. Mount all API routes at `/api/v1`.
9. Handle 404 routes.
10. Handle application errors globally.

## Backend Route Groups

| Base Route | File | Purpose |
| --- | --- | --- |
| `/api/v1/auth` | `authRoutes.js` | Registration, login, OTP, sessions, profile, avatar. |
| `/api/v1/admin` | `adminRoutes.js` | Admin stats, profile, users, faculty management. |
| `/api/v1/resources` | `resourceRoutes.js` | Admin-managed resource links. |
| `/api/v1/study-materials` | `studyMaterialRoutes.js` | Uploads, approval queue, public approved content. |
| `/api/v1/syllabus` | `syllabusRoutes.js` | Public syllabus list and admin syllabus creation/deletion. |
| `/api/v1/health` | `routes/index.js` | API health check. |

## Database Architecture

The backend uses SQLite with migration files in `backend/migrations`.

### Database Configuration

The database path is controlled by `DB_PATH`. If not configured, it defaults to:

```text
backend/data/studyhub.sqlite
```

SQLite settings used at startup:

- Foreign keys enabled
- WAL journal mode
- Normal synchronous mode
- 5000 ms busy timeout

## Core Data Flow

### Login Flow

1. User submits email and password from React.
2. Frontend calls `POST /api/v1/auth/login`.
3. Backend validates body with Zod.
4. Backend finds user by email.
5. Backend compares password using bcrypt.
6. Backend checks email verification.
7. Backend signs an access token.
8. Backend creates a refresh token record and sets an HTTP-only refresh cookie.
9. Frontend stores the access token and user in `localStorage`.
10. Frontend redirects based on role.

### Study Upload Flow

1. Authenticated user opens `/add-study-content`.
2. User selects PDF, PPT, PPTX, DOCX, or Markdown file.
3. Frontend sends `FormData` to `POST /api/v1/study-materials`.
4. Backend authenticates the access token.
5. Backend blocks unapproved faculty.
6. Multer saves the file in `backend/uploads/`.
7. Backend inserts a `pending` row into `study_materials`.
8. Admin views pending upload in `/admin/approvals`.
9. Admin approves or rejects the upload.
10. Approved uploads appear publicly in `/resources`.

### Syllabus Flow

1. Admin creates a syllabus entry from `/admin/syllabus`.
2. Backend validates title, code, branch, semester, type, credits, and content.
3. If a file is uploaded, Multer saves it in `backend/uploads/syllabus/`.
4. Backend creates or reuses a subject row.
5. Backend inserts a syllabus row.
6. Students search and view syllabus from `/syllabus`.

## Deployment Considerations

- The backend includes `vercel.json` and `api/index.js`, but local filesystem uploads can be problematic on serverless platforms because files may not persist.
- For production, a cloud object storage provider should replace local uploads.
- Redis is optional; without it, caching works in memory for the current process only.
- SMTP variables are required for real email delivery. Without SMTP, OTPs may still be visible in server logs during development.
