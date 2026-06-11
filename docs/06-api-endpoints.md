# API Endpoints

Base URL:

```text
/api/v1
```

Frontend default:

```text
VITE_API_URL=/api/v1
```

## Response Shape

Most API responses follow:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Some endpoints still return legacy fields for compatibility. New code should prefer `data`.

## Authentication Headers

Protected endpoints expect:

```text
Authorization: Bearer <access-token>
```

Refresh-token endpoints read the HTTP-only refresh cookie.

## Health

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Server health response. |

## Auth: `/auth`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public, rate limited | Register student/faculty and enqueue OTP email. |
| `POST` | `/auth/login` | Public, rate limited | Login with email/password. |
| `POST` | `/auth/verify-otp` | Public, rate limited | Verify OTP and create session. |
| `POST` | `/auth/refresh` | Refresh cookie, rate limited | Rotate refresh token and return new session. |
| `POST` | `/auth/logout` | Optional refresh cookie | Revoke refresh-token family and clear cookie. |
| `GET` | `/auth/me` | User | Return current authenticated user. |
| `PUT` | `/auth/updatedetails` | User | Update name, branch, or year. |
| `PUT` | `/auth/updateavatar` | User | Upload avatar image. |
| `PATCH` | `/auth/preferences` | User | Merge user preference JSON. |
| `GET` | `/auth/faculty/profile` | Faculty | Return current faculty profile. |

Student registration:

```json
{
  "role": "student",
  "name": "Student Name",
  "email": "student@example.com",
  "password": "password123",
  "branch": "Computer",
  "year": "SE"
}
```

Faculty registration:

```json
{
  "role": "faculty",
  "name": "Faculty Name",
  "email": "faculty@example.com",
  "password": "password123",
  "designation": "Assistant Professor",
  "department": "Computer Engineering",
  "collegeName": "College Name",
  "subjects": ["DBMS", "OS"]
}
```

Preferences update:

```json
{
  "preferences": {
    "editorTheme": "dark"
  }
}
```

Launch note: `preferences` currently accepts arbitrary keys. Add server-side schema before production.

## Admin: `/admin`

All endpoints require admin role.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/stats` | Dashboard totals and 7-day activity counts. |
| `GET` | `/admin/profile` | Current admin profile. |
| `PATCH` | `/admin/profile` | Update first name, last name, or email. |
| `GET` | `/admin/users` | List student users with pagination/search. |
| `DELETE` | `/admin/users/:id` | Soft-delete non-admin user. |
| `GET` | `/admin/faculty/pending` | List faculty waiting for approval. |
| `GET` | `/admin/faculty/all` | List all faculty users. |
| `PATCH` | `/admin/faculty/:id/approve` | Approve faculty access. |
| `PATCH` | `/admin/faculty/:id/reject` | Revoke faculty approval. |

`GET /admin/users` supports:

| Query | Purpose |
| --- | --- |
| `page` | Page number. |
| `limit` | Page size, max 100. |
| `search` | Search by student name/email. |

## Resources: `/resources`

Resources are admin-managed records. The frontend dynamically utilizes this API by applying category filters to power different sections of the application, such as **IMP Questions** and **Sample Papers**. Public callers see approved records only. Admin callers can request status filters.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/resources` | Optional | List resources (supports filtering by `category`, e.g., "IMP Questions"). |
| `POST` | `/resources` | Admin | Create approved resource with URL or file, assigned to a specific category. |
| `GET` | `/resources/:id` | Optional | Fetch one resource. |
| `PATCH` | `/resources/:id` | Admin | Update resource. |
| `DELETE` | `/resources/:id` | Admin | Soft-delete resource. |
| `GET` | `/resources/:id/file` | Public | Stream uploaded resource file. |

Known gap: query validation accepts `page` and `limit`, but the controller currently returns all matching resources.

## Study Materials: `/study-materials`

Study materials are user submissions that go through admin moderation.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/study-materials/approved` | Public | List approved materials. |
| `GET` | `/study-materials/pending` | Admin | List pending submissions. |
| `GET` | `/study-materials/rejected` | Admin | List rejected submissions. |
| `GET` | `/study-materials/my` | User | List current user's uploads. |
| `GET` | `/study-materials/bookmarks` | User | List bookmarked materials. |
| `POST` | `/study-materials/:id/bookmark` | User | Toggle bookmark. |
| `POST` | `/study-materials` | User, approved-faculty check | Upload material file or URL. |
| `PATCH` | `/study-materials/:id/status` | Admin | Approve or reject material. |
| `GET` | `/study-materials/faculty/stats` | Faculty/Admin | Contribution stats. |
| `POST` | `/study-materials/:id/feedback` | Approved faculty/Admin | Create or update material feedback. |
| `GET` | `/study-materials/:id/feedback` | User | Fetch material feedback. |

Upload fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | Yes | Material title. |
| `subject` | Yes | Subject name. |
| `type` | Optional | Inferred from file when present. |
| `author` | Optional | Credit name. |
| `url` | Required if no file | External material URL. |
| `file` | Required if no URL | Uploaded file. |

Allowed file extensions:

- `.pdf`
- `.ppt`
- `.pptx`
- `.docx`
- `.md`

Maximum file size:

```text
50 MB
```

Known gap: list endpoints are not paginated.

## Syllabus: `/syllabus`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/syllabus` | Public | List syllabus records. |
| `POST` | `/syllabus` | Admin | Create syllabus from upload or content. |
| `DELETE` | `/syllabus/:id` | Admin | Soft-delete syllabus. |
| `GET` | `/syllabus/:id/file` | Public | Stream syllabus PDF file. |

Create JSON example:

```json
{
  "title": "Data Structures and Algorithms",
  "code": "CS401",
  "branch": "Computer",
  "semester": "4",
  "type": "markdown",
  "contentUrl": "# Data Structures and Algorithms"
}
```

Known gap: `credits` exists in the database but is not accepted by the create schema.

## Notes: `/notes`

All notes endpoints require authentication.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/notes` | Fetch current user's notes. |
| `GET` | `/notes/:id` | Fetch one current-user note. |
| `POST` | `/notes` | Create note. |
| `PUT` | `/notes/:id` | Update content and metadata. |
| `PATCH` | `/notes/:id/rename` | Rename note. |
| `DELETE` | `/notes/:id` | Soft-delete note. |

Supported note metadata:

- `icon`
- `cover`
- `is_favorite`
- `is_trash`
- `parent_id`
- `font`
- `full_width`

Known gaps:

- No request schema for note payloads.
- No parent-cycle prevention.
- No conflict resolution for concurrent edits.

## Platform Feedback: `/feedback`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/feedback` | User | Submit bug/feature/general feedback. |
| `GET` | `/feedback` | Admin | List platform feedback. |
| `PUT` | `/feedback/:id/status` | Admin | Update feedback status. |
| `DELETE` | `/feedback/:id` | Admin | Soft-delete feedback. |

## Academic Content: `/subjects` And `/topics`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/subjects?branch=Computer&semester=4` | Public | Fetch subjects. |
| `GET` | `/subjects/:id/units` | Public | Fetch units and nested topics. |
| `GET` | `/topics/:id` | Public | Fetch one topic. |
| `PUT` | `/topics/:id` | Admin | Update topic. |

## Content: `/content`

This is a secondary content module and should be reviewed for product overlap with study materials/resources before launch.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/content` | Public | List study content by type/role/sort. |
| `POST` | `/content` | User, approved-faculty check | Upload content. |
| `GET` | `/content/:id/file` | Public | Stream or redirect content file. |
| `DELETE` | `/content/:id` | Owner/Admin | Soft-delete content. |

## File Proxy: `/files`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/files/:studyMaterialId` | Optional | Stream study-material file. Public only when material is approved; admins can preview non-approved files. |

## Validation Enums

Branch:

```text
Computer, IT, Civil, Mechanical, Electrical, ENTC, Both
```

Year:

```text
FE, SE, TE, BE
```

Resource types:

```text
pdf, video, doc, markdown
```

Study material types:

```text
PDF, PPT, DOCX, Markdown, Video, Notes
```

## API Improvement Priorities

1. Add schemas to notes and preferences endpoints.
2. Add pagination to resources, study materials, syllabus, notes, feedback, and content.
3. Standardize error handling in frontend service clients.
4. Add OpenAPI documentation.
5. Add integration tests for all protected routes.
