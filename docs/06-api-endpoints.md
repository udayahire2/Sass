# API Endpoints

Base URL:

```text
/api/v1
```

The frontend builds this from `VITE_API_URL` or defaults to `/api/v1`.

## Standard Response Shape

Most successful responses use:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Some endpoints also return legacy top-level fields for compatibility with existing frontend code.

## Health

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Returns server health, message, and timestamp. |

## Authentication: `/auth`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register student/faculty and create OTP. |
| `POST` | `/auth/login` | Public | Login with email and password. |
| `POST` | `/auth/verify-otp` | Public | Verify 6-digit OTP and create session. |
| `POST` | `/auth/refresh` | Refresh cookie | Rotate refresh token and create a new access token. |
| `POST` | `/auth/logout` | Optional refresh cookie | Revoke refresh-token family and clear cookie. |
| `GET` | `/auth/me` | User | Return current authenticated user. |
| `GET` | `/auth/faculty/profile` | Faculty user | Return current faculty profile. |
| `PUT` | `/auth/updatedetails` | User | Update name, branch, or year. |
| `PUT` | `/auth/updateavatar` | User | Upload avatar image. |

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

OTP verification:

```json
{
  "email": "student@example.com",
  "otp": "123456"
}
```

Profile update:

```json
{
  "name": "Updated Name",
  "branch": "Computer",
  "year": "TE"
}
```

Avatar upload uses `multipart/form-data` with field name `avatar`.

## Admin: `/admin`

All admin endpoints require:

```text
Authorization: Bearer <access-token>
```

The authenticated user must have `role = admin`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/stats` | Dashboard totals and 7-day activity counts. |
| `GET` | `/admin/profile` | Current admin profile. |
| `PATCH` | `/admin/profile` | Update admin first name, last name, or email. |
| `GET` | `/admin/users` | List student users with optional pagination/search. |
| `DELETE` | `/admin/users/:id` | Soft-delete a non-admin user. |
| `GET` | `/admin/faculty/pending` | List faculty waiting for approval. |
| `GET` | `/admin/faculty/all` | List all faculty users. |
| `PATCH` | `/admin/faculty/:id/approve` | Approve faculty access. |
| `PATCH` | `/admin/faculty/:id/reject` | Revoke faculty approval. |

`GET /admin/users` accepts:

| Query | Purpose |
| --- | --- |
| `page` | Page number. Defaults to 1. |
| `limit` | Page size. Maximum 100. |
| `search` | Search by student name or email. |

## Resources: `/resources`

Resources are admin-managed URL records. Public callers see approved records only. Admin callers can filter by status.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/resources` | Optional | List resources. |
| `POST` | `/resources` | Admin | Create an approved resource record. |
| `GET` | `/resources/:id` | Optional | Get one resource. Public cannot view non-approved resources. |
| `PATCH` | `/resources/:id` | Admin | Update a resource. |
| `DELETE` | `/resources/:id` | Admin | Soft-delete a resource. |

Resource query parameters:

| Query | Purpose |
| --- | --- |
| `branch` | Filter by branch. |
| `semester` | Filter by semester. |
| `search` | Search title, subject, or author. |
| `status` | Admin-only status filter. |
| `page`, `limit` | Accepted by validation, but current controller returns all matching rows. |

Create resource:

```json
{
  "title": "Unit 1 DBMS Notes",
  "subject": "DBMS",
  "semester": "Sem 4",
  "branch": "Computer",
  "type": "pdf",
  "description": "Complete unit 1 notes with examples.",
  "category": "Notes",
  "pattern": "2019",
  "unit": "All",
  "year": "SE",
  "author": "Admin",
  "url": "https://example.com/dbms-unit-1.pdf"
}
```

## Study Materials: `/study-materials`

Study materials are user submissions that go through admin moderation.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/study-materials/approved` | Public | List approved materials visible to students. |
| `GET` | `/study-materials/pending` | Admin | List pending submissions. |
| `GET` | `/study-materials/rejected` | Admin | List rejected submissions. |
| `GET` | `/study-materials/my` | User | List uploads created by the logged-in user. |
| `GET` | `/study-materials/bookmarks` | User | List materials bookmarked by the logged-in user. |
| `POST` | `/study-materials/:id/bookmark` | User | Toggle bookmark for one material. |
| `POST` | `/study-materials` | User plus approved-faculty check | Upload or submit a study material. |
| `PATCH` | `/study-materials/:id/status` | Admin | Approve or reject a material. |
| `GET` | `/study-materials/faculty/stats` | Faculty/Admin | Return contribution and feedback counts for current user. |
| `GET` | `/study-materials/:id/feedback` | User | Fetch feedback for one material. |
| `POST` | `/study-materials/:id/feedback` | Approved faculty/Admin | Create or update feedback for one material. |

Upload study material uses `multipart/form-data`.

Fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | Yes | Material title. |
| `subject` | Yes | Subject name. |
| `type` | Optional | `PDF`, `PPT`, `DOCX`, `Markdown`, `Video`, or `Notes`. If a file is uploaded, type is inferred and must match if supplied. |
| `author` | Optional | Credit name. Defaults to logged-in user name or `Student`. |
| `url` | Required only if no file | External material URL. |
| `file` | Required only if no URL | Uploaded file. |

Allowed uploaded extensions:

- `.pdf`
- `.ppt`
- `.pptx`
- `.docx`
- `.md`

Maximum file size:

```text
50 MB
```

Update material status:

```json
{
  "status": "approved",
  "reason": "Optional reason when rejected"
}
```

Feedback request:

```json
{
  "feedback_text": "Clear and useful material for revision.",
  "rating": 5
}
```

## Syllabus: `/syllabus`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/syllabus` | Public | List all non-deleted syllabus records. |
| `GET` | `/syllabus/:id/file` | Public | Stream an uploaded syllabus PDF file. |
| `POST` | `/syllabus` | Admin | Create syllabus record from uploaded file or supplied content. |
| `DELETE` | `/syllabus/:id` | Admin | Soft-delete syllabus record. |

Create syllabus with JSON:

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

Create syllabus with upload uses `multipart/form-data`.

Fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | Yes | Course title. |
| `code` | Yes | Subject code. |
| `branch` | Yes | Branch enum. Supports `Both` in validation. |
| `semester` | Yes | `1` to `8`, or `all`. |
| `type` | Yes | `pdf` or `markdown`. Overwritten from uploaded file extension when file is supplied. |
| `contentUrl` | Required after upload preparation | PDF path or Markdown content. |
| `file` | Optional | PDF, Markdown, or text file. |

Allowed file extensions:

- `.pdf`
- `.md`
- `.markdown`
- `.txt`

Maximum file size:

```text
20 MB
```

Current note:

- Credits are not accepted by the current create syllabus schema. New rows store `credits = 0`.

## Academic Content: `/subjects` and `/topics`

These endpoints serve seeded academic content.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/subjects?branch=Computer&semester=4` | Public | Fetch subjects for a branch/semester. |
| `GET` | `/subjects/:id/units` | Public | Fetch units and nested topics for a subject. |
| `GET` | `/topics/:id` | Public | Fetch a topic with Markdown content, video info, unit, and subject metadata. |

## File Proxy: `/files`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/files/:studyMaterialId` | Optional | Stream a local file for a study material. Non-approved material files are restricted to admins. |

## Validation Enums

Branch:

```text
Computer, IT, Civil, Mechanical, Electrical, ENTC, Both
```

Academic year:

```text
FE, SE, TE, BE
```

Resource types:

```text
pdf, video, doc, markdown
```

Resource categories:

```text
Notes, PYQ, Syllabus, Lab Manual, Reference Book, Other
```

Study material types:

```text
PDF, PPT, DOCX, Markdown, Video, Notes
```
