# NMU Study Hub Documentation

Updated: 2026-05-27

This folder is the technical and product documentation source of truth for launching NMU Study Hub with real users. It reflects the current React frontend, Express backend, SQLite database, upload flows, and the production gaps found during the latest codebase audit.

## Recommended Reading Order

| Order | Document | Purpose |
| --- | --- | --- |
| 1 | [01-introduction.md](./01-introduction.md) | Product purpose, scope, current modules, and user journeys. |
| 2 | [02-user-types.md](./02-user-types.md) | Student, faculty, and admin roles, permissions, and route access. |
| 3 | [03-requirements.md](./03-requirements.md) | Implemented, partial, and missing requirements. |
| 4 | [04-system-architecture.md](./04-system-architecture.md) | Current architecture, module boundaries, deployment shape, and diagrams. |
| 5 | [05-database-design.md](./05-database-design.md) | SQLite schema, relationships, migrations, and database concerns. |
| 6 | [06-api-endpoints.md](./06-api-endpoints.md) | REST API groups, auth rules, request shapes, and known gaps. |
| 7 | [07-authentication.md](./07-authentication.md) | OTP, JWT, refresh-token rotation, frontend auth state, and risks. |
| 8 | [08-file-storage.md](./08-file-storage.md) | Upload categories, file proxying, local storage limitations, and object-storage migration. |
| 9 | [09-improvement-plan.md](./09-improvement-plan.md) | Current issues, flow problems, UI/UX gaps, backend limitations, security risks, and improvement plan. |
| 10 | [10-production-readiness-launch-plan.md](./10-production-readiness-launch-plan.md) | Remaining work to launch NMU Study Hub to real users. |
| 11 | [11-application-flow-diagrams.md](./11-application-flow-diagrams.md) | Mermaid flow diagrams for product, auth, upload, notes, admin, and deployment flows. |
| 12 | [12-exam-pattern-intelligence.md](./12-exam-pattern-intelligence.md) | Exam-Pattern Intelligence workflow, formulas, database schema, and Mermaid diagrams. |

## Current Runtime Source Of Truth

| Area | Active path |
| --- | --- |
| Frontend | `app/src` |
| Frontend router | `app/src/router.tsx` |
| Frontend API clients | `app/src/services` |
| Backend API | `backend/src` |
| Backend entry point | `backend/src/server.js` |
| Serverless entry point | `backend/api/index.js` |
| Database migrations | `backend/migrations` |
| Academic seed source | `app/src/data/study-data.ts` |
| Academic seed script | `backend/src/seeds/seedSubjects.js` |
| Local uploads | `backend/uploads` |

## Launch Readiness Snapshot

NMU Study Hub already has the core shape of a real academic platform:

- Student and faculty signup with OTP verification.
- Admin controlled faculty approval.
- Study material uploads with admin moderation.
- Syllabus and resource management.
- API-driven subject, unit, and topic browsing.
- User profile, avatar upload, bookmarks, feedback, and notes.
- SQLite migrations, JWT auth, refresh-token rotation, upload validation, and optional Redis cache.

The platform is not yet production-ready because these areas still need work:

- Local file storage must move to durable object storage.
- Access-token handling should move away from `localStorage`.
- Automated tests are missing for critical flows.
- Several list APIs do not paginate.
- Search is mostly client-side and will not scale.
- Deployment needs persistent database, backups, migrations policy, logging, monitoring, and email worker strategy.
- UI still has unfinished and inconsistent areas such as placeholder search boxes, profile notes placeholder, and route guard edge cases.

## Recent Implementation Hardening

The latest audit also applied small low-risk improvements:

- Backend starts the email job worker in long-running server mode.
- Basic request sanitization is wired into the Express app.
- Auth write and refresh endpoints now have in-memory IP rate limiting.
- OTP values are no longer logged in production.
- Code-block fallback rendering now escapes HTML before injecting fallback markup.

These fixes improve the current implementation, but production still needs distributed rate limiting, real SMTP or email provider delivery, and hardened token storage.

## Documentation Policy

When code changes, update the matching document in this folder in the same pull request:

- Route or payload change: update `06-api-endpoints.md`.
- Auth/session change: update `07-authentication.md`.
- Table or migration change: update `05-database-design.md`.
- Upload/storage change: update `08-file-storage.md`.
- Product or flow change: update `01-introduction.md` and `11-application-flow-diagrams.md`.
- Launch-readiness or risk change: update `09-improvement-plan.md` and `10-production-readiness-launch-plan.md`.
