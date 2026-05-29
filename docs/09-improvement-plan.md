# Current Issues And Improvement Plan

This document captures current product architecture issues, flow problems, UI/UX gaps, backend limitations, database concerns, scalability risks, security risks, and missing production-level features.

## Recent Fixes Applied During Audit

| Area | Improvement |
| --- | --- |
| Background jobs | Long-running server now starts the job worker. |
| Auth abuse protection | Register, login, OTP verify, and refresh routes now have in-memory IP rate limits. |
| Request hygiene | Basic request sanitization is now wired into Express. |
| OTP secrecy | OTPs are no longer printed in production logs. |
| Code rendering safety | Code-block fallback now escapes HTML before injecting fallback markup. |

These are useful hardening steps, not a complete production security program.

## Current Product Architecture Issues

| Issue | Impact | Recommendation |
| --- | --- | --- |
| Active and legacy backends coexist | Maintainers may deploy or edit the wrong backend. | Remove/archive `app/backend` and legacy Mongoose models. |
| Multiple content concepts overlap | `resources`, `study_materials`, and `study_content` are not clearly differentiated in product UX. | Define product taxonomy and consolidate or document module boundaries. |
| Local file storage is central to flows | Uploads are not durable in serverless/multi-instance deployment. | Move files to object storage. |
| SQLite sync database access | Simple locally but blocks Node event loop for heavy queries. | Add pagination now; evaluate Postgres for scale. |
| Frontend route guards rely on localStorage | UI route access can be stale until API rejects. | Add server-verified route guard with refresh support. |

## Existing Issues

| Area | Issue |
| --- | --- |
| Documentation | Root README and some generated docs had outdated stack notes and mojibake. `/docs` now rewritten; older untracked docs should be cleaned or regenerated. |
| Tests | Backend test command runs 0 tests. Frontend has no visible automated test suite. |
| Build | Vite build passes but warns about large chunks and a CSS minification warning. |
| Code quality | Several service methods swallow errors and return `[]` or `null`, which hides operational issues. |
| Unused code | `app/src/lib/dummy-data.ts`, `mockResources`, and legacy backend folders should be reviewed. |
| User-facing placeholders | Admin/faculty layout search boxes and notification bell are not functional. |

## Flow Problems

### Authentication Flow

- Backend supports refresh rotation, but frontend does not use a centralized refresh-on-401 API client.
- Invalid access tokens often lead to logout instead of silent refresh.
- Password reset is missing.
- Faculty can log in before approval, which is acceptable, but UI needs clearer disabled contribution messaging.

### Navigation Flow

- `/admin` index currently renders `HomePage` instead of redirecting to `/admin/dashboard`.
- `AdminLayout` and `FacultyLayout` redirect non-matching roles to `/dashboard`, but no `/dashboard` route is registered.
- `/profile/notes` shows a coming-soon placeholder even though `/notes` exists.
- `/add-study-content` is reachable from general navigation, but backend is the main enforcement layer.

### Content Flow

- Student-facing content is split between `/resources`, `/study-stock`, syllabus, and resource collections.
- The difference between admin-managed resources and user-submitted study materials is not obvious in UI labels.
- Rejected upload reasons are not consistently surfaced to uploaders.

### Notes Flow

- Notes autosave is useful but has no conflict resolution.
- Notes tree supports parent IDs but not cycle prevention.
- Notes theme preference fetch is implemented ad hoc inside `NotesPage` instead of using the central API layer.

## UI/UX Gaps

| Gap | User impact | Suggested fix |
| --- | --- | --- |
| Inconsistent navigation labels | Users may not understand Study Stock vs Resources vs Materials. | Create a unified information architecture and navigation naming system. |
| Placeholder admin/faculty search | Users expect search to work. | Implement global scoped search or remove visual controls. |
| Notification bell is decorative | Creates false expectation. | Build notification center or remove until ready. |
| Profile notes placeholder | Conflicts with real notes route. | Link to `/notes` or embed recent notes. |
| Error feedback inconsistent | Some failures only log to console. | Standardize toast and inline error states. |
| Mobile admin/faculty review | Needs QA for tables, modals, and file preview. | Add responsive QA checklist. |
| Empty states vary | Some modules are polished, others are sparse. | Standardize empty/loading/error components. |
| Onboarding incomplete | New users need guidance after signup. | Add role-specific first-run onboarding. |

## Backend Limitations

| Limitation | Current state | Required improvement |
| --- | --- | --- |
| Pagination | Partial. Some admin endpoints paginate; many public lists do not. | Add `LIMIT/OFFSET` or cursor pagination everywhere. |
| Search | Mostly client-side and SQL LIKE. | Add SQLite FTS or search service. |
| Queue | Worker starts in long-running server only. | Add production worker deployment. |
| Rate limiting | In-memory auth limiter. | Redis-backed distributed limiter. |
| Validation | Strong for many routes, weak for notes/preferences. | Add Zod schemas for notes and preferences. |
| Upload validation | Extension/MIME checks, no content scan. | Add MIME sniffing and virus scanning. |
| Observability | Console logs only. | Add structured logs, error tracking, metrics. |
| API docs | Markdown only. | Add OpenAPI/Swagger spec. |

## Database Concerns

| Concern | Risk | Fix |
| --- | --- | --- |
| Local SQLite file | Data loss on ephemeral hosting. | Durable volume or managed SQL. |
| Auto migrations on startup | Bad migration can break boot. | CI/CD migration step with rollback plan. |
| No backup policy | Data loss risk. | Scheduled backups and restore drills. |
| Notes parent cycles | Potential UI recursion or broken tree. | Validate parent update. |
| JSON preferences | No schema. | Validate allowed preference keys and values. |
| No audit table | Admin actions not traceable. | Add `audit_logs`. |
| Search indexes missing | Slow search at scale. | SQLite FTS or search service. |

## Scalability Issues

| Area | Current bottleneck |
| --- | --- |
| Frontend bundle | Shiki/editor dependencies contribute to large chunks. |
| API lists | Several endpoints return all rows. |
| File serving | Local disk and single API host do not scale. |
| Cache | In-memory fallback is per process. |
| Rate limiting | In-memory limiter is per process. |
| Database | Sync SQLite access is not ideal for concurrent heavy writes. |
| Search | Client-side search requires fetching large datasets first. |

## Security Risks

| Risk | Severity | Notes |
| --- | --- | --- |
| Access token in localStorage | High | XSS can steal bearer token. |
| Missing password reset | High | Users cannot recover accounts safely. |
| No audit logging | High | Admin actions cannot be investigated. |
| Static resource file serving | Medium | Could expose files by URL if future private statuses are introduced. |
| Upload content scanning missing | Medium | Files are not virus scanned. |
| Distributed rate limiting missing | Medium | Current limiter does not protect multi-instance deployments. |
| Preference payload unbounded | Medium | Arbitrary JSON can accumulate bad data. |
| No CSP tuning documented | Medium | Helmet default is not a complete frontend CSP strategy. |

## Missing Production-Level Features

- Password reset and account recovery.
- Email provider integration and delivery monitoring.
- Centralized API client with refresh and retry.
- Durable object storage.
- Backup and restore runbook.
- Automated tests and CI gates.
- Observability: logs, metrics, traces, error tracking.
- Audit logs for admin actions.
- Admin notification center.
- Full subject/unit/topic admin CRUD.
- Server-side search and pagination.
- Terms, privacy policy, content policy, and takedown workflow.
- Launch analytics and feedback loop.

## Priority Roadmap

### P0 - Must Finish Before Launch

1. Durable file storage.
2. Password reset.
3. Frontend refresh-on-401 flow.
4. Critical automated tests.
5. Database backup/restore plan.
6. Real email delivery and worker deployment.
7. Security review for token storage and file access.

### P1 - Launch Quality

1. Pagination and server-side search.
2. Clear navigation taxonomy.
3. Rejection reasons shown to uploaders.
4. Route guard cleanup.
5. Resource edit UI.
6. Admin/faculty search and notification decision.
7. Notes validation and parent-cycle prevention.

### P2 - Growth

1. Full-text topic/material search.
2. Analytics dashboard.
3. Notification center.
4. Content quality scoring and duplicate detection.
5. Object-storage CDN integration.
6. Postgres migration if usage grows beyond SQLite comfort zone.
