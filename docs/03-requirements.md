# Requirements And Current Status

This document separates what is already implemented from what is partial or missing for a real launch.

## Status Legend

| Status | Meaning |
| --- | --- |
| Implemented | Works in the current codebase. |
| Partial | Exists, but needs hardening, polish, or missing edge cases. |
| Missing | Required for production launch but not implemented. |

## Functional Requirements

### Authentication And Account Management

| Requirement | Status | Notes |
| --- | --- | --- |
| Student signup | Implemented | Name, email, password, branch, year. |
| Faculty signup | Implemented | Includes designation, department, college, and subjects. |
| Admin account creation | Implemented | Via environment startup seed and script. |
| Email OTP verification | Partial | OTP hashing and expiry exist. Real delivery depends on job worker and SMTP. |
| Login | Implemented | Email/password with bcrypt. |
| Access token generation | Implemented | JWT access token. |
| Refresh-token rotation | Partial | Backend exists; frontend does not fully use refresh recovery around 401s. |
| Logout | Implemented | Revokes refresh-token family. |
| Profile update | Implemented | Name, branch, year. |
| Avatar upload | Implemented | Client crop plus backend local upload. |
| Password reset | Missing | Needed for real users. |
| Email change flow | Missing | No verification flow for changed email. |
| Device/session management | Missing | Users cannot view/revoke active sessions. |

### Academic Content Browsing

| Requirement | Status | Notes |
| --- | --- | --- |
| Branch/semester selection | Implemented | `/resources`. |
| Subject listing | Implemented | API-driven from SQLite. |
| Unit and topic listing | Implemented | API-driven from SQLite. |
| Topic Markdown viewing | Implemented | Topic viewer renders content. |
| Topic edit for admin | Partial | Route exists for topic edit, but full subject/unit/topic CRUD is missing. |
| Academic seed import | Implemented | `backend/src/seeds/seedSubjects.js`. |
| Bulk import tools | Partial | Seed script exists, no admin import UI. |

### Study Materials And Bookmarks

| Requirement | Status | Notes |
| --- | --- | --- |
| Approved material listing | Implemented | Public endpoint and UI. |
| Upload material | Implemented | File or URL; pending status. |
| Admin moderation | Implemented | Approve/reject endpoint and UI. |
| Rejection reason | Partial | Backend supports reason; frontend display is inconsistent. |
| Bookmark toggle | Implemented | Per user/material. |
| Bookmarked list | Implemented | Profile page. |
| Material pagination | Missing | Lists return all rows. |
| Material full-text search | Missing | Search is largely client-side. |
| Duplicate detection | Missing | No duplicate upload detection. |

### Syllabus And Resources

| Requirement | Status | Notes |
| --- | --- | --- |
| Syllabus listing | Implemented | Public endpoint and UI. |
| Syllabus upload | Implemented | Admin PDF/Markdown upload. |
| Syllabus deletion | Implemented | Soft delete. |
| Syllabus credits | Partial | DB column exists, create flow stores `0`. |
| Resource create | Implemented | Admin create UI and API. |
| Resource update | Partial | API supports update, UI needs full edit workflow. |
| Resource delete | Implemented | Soft delete. |
| Resource pagination | Missing | Controller validates page/limit but returns all rows. |

### Notes

| Requirement | Status | Notes |
| --- | --- | --- |
| Create notes | Implemented | `/notes`. |
| Rich text editor | Implemented | TipTap Markdown conversion. |
| Sidebar tree | Implemented | Parent/child metadata. |
| Favorites and trash | Implemented | Stored metadata. |
| Cover/icon/page options | Implemented | Stored metadata. |
| Editor theme preferences | Implemented | Stored in `users.preferences`. |
| Offline/conflict handling | Missing | No sync conflict or offline queue. |
| Note search scalability | Partial | Local filtering only. |

### Admin And Faculty Operations

| Requirement | Status | Notes |
| --- | --- | --- |
| Admin dashboard | Implemented | Basic stats. |
| Student management | Implemented | Search/list/delete. |
| Faculty approval | Implemented | Approve/revoke. |
| Faculty dashboard | Implemented | Stats, uploads, feedback. |
| Material feedback | Implemented | One feedback per reviewer/material. |
| Platform feedback | Implemented | Submit and admin manage. |
| Admin notification center | Missing | Bell icon is visual only. |
| Admin global search | Missing | Search input is visual only. |

## Non-Functional Requirements

### Security

| Requirement | Status | Notes |
| --- | --- | --- |
| Password hashing | Implemented | bcrypt with at least 12 rounds. |
| Access/refresh token secrets | Implemented | Separate env values supported. |
| Refresh-token hash storage | Implemented | Raw refresh token is not stored. |
| HTTP-only refresh cookie | Implemented | Production cookie uses `secure` and `sameSite=none`. |
| Role authorization | Implemented | Backend middleware. |
| Input validation | Partial | Zod schemas exist for many routes; note payloads need tighter schema. |
| Request sanitization | Implemented | Basic null-byte trimming is now wired globally. |
| Auth rate limiting | Partial | In-memory IP limiter now protects auth write/refresh routes; production needs distributed limiter. |
| Access-token storage hardening | Missing | Frontend stores access token in `localStorage`. |
| Security headers | Implemented | Helmet enabled. |
| Audit logs | Missing | No admin/action audit trail. |

### Reliability

| Requirement | Status | Notes |
| --- | --- | --- |
| Database migrations | Implemented | Automatic startup and CLI migration script. |
| Foreign keys | Implemented | Enabled in SQLite startup. |
| Soft deletes | Implemented | Most main tables. |
| Job queue | Partial | Long-running server starts worker; serverless needs external worker strategy. |
| Backups | Missing | No documented DB/file backup process. |
| Error reporting | Missing | No Sentry/OpenTelemetry/etc. |

### Performance

| Requirement | Status | Notes |
| --- | --- | --- |
| Admin stats cache | Implemented | 60 second cache. |
| Redis support | Partial | Optional for cache, not rate limiter or queue. |
| Pagination | Partial | Some admin endpoints paginate; many public/content endpoints do not. |
| Code splitting | Partial | Vite build warns about large chunks. |
| Search indexing | Missing | No full-text search index. |

### Maintainability

| Requirement | Status | Notes |
| --- | --- | --- |
| Frontend service layer | Implemented | `app/src/services`. |
| Backend route grouping | Implemented | `backend/src/routes`. |
| Validation schemas | Implemented | `backend/src/validation/schemas.js`. |
| Documentation | Improved | `/docs` rewritten in this audit. |
| Automated tests | Missing | Backend test runner exists, but test count is 0. |
| Legacy cleanup | Missing | `app/backend` and Mongoose model files remain. |

## Production Requirement Summary

The minimum production release should not launch until these are complete:

1. Durable file storage.
2. Real email delivery and worker deployment strategy.
3. Password reset flow.
4. Frontend refresh-token recovery.
5. Access-token storage hardening.
6. Automated tests for auth, upload, approval, bookmarks, notes, and file access.
7. Backups and restore runbook.
8. Monitoring and error tracking.
9. Pagination and server-side search for large lists.
