# NMU Study Hub Documentation

This folder documents the current implementation of NMU Study Hub across the React frontend and Express backend.

Recommended reading order:

1. `01-introduction.md` - Product purpose, modules, and actual user journeys.
2. `02-user-types.md` - Student, faculty, and admin roles.
3. `03-requirements.md` - Implemented functional and non-functional requirements.
4. `04-system-architecture.md` - Frontend, backend, routing, data flow, and deployment notes.
5. `05-database-design.md` - SQLite schema, relationships, indexes, and seed data.
6. `06-api-endpoints.md` - REST API reference.
7. `07-authentication.md` - OTP, JWT, refresh tokens, profile updates, and authorization.
8. `08-file-storage.md` - Upload handling, file proxy behavior, limits, and production notes.
9. `09-improvement-plan.md` - Current gaps and pragmatic next steps.

Short summary:

NMU Study Hub is a React 19 + Express 5 + SQLite academic resource platform. It supports student and faculty signup, OTP verification, admin faculty approval, seeded subject/unit/topic content, public syllabus search, study-material uploads, admin moderation, bookmarks, faculty feedback, profile/avatar management, and admin dashboards.

Implementation source of truth:

- Frontend: `app/src`
- Backend API: `backend/src`
- Database schema: `backend/migrations`
- Documentation: `docs`

The older `app/backend` folder and backend Mongoose model files remain in the repository, but the active app uses the top-level `backend/` Express API with SQLite.
