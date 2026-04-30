# API Endpoints

Base URL:

```text
/api/v1
```

The frontend builds this from `VITE_API_URL` or defaults to `/api/v1`.

## Standard Response Shape

Most successful backend responses follow this structure:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Some endpoints also include legacy fields for compatibility with existing frontend code.

## Health

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Returns server health, message, and timestamp. |

## Authentication: `/auth`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register student or faculty user and create OTP. |
| `POST` | `/auth/login` | Public | Login with email and password. |
| `POST` | `/auth/verify-otp` | Public | Verify 6-digit OTP and create session. |
| `POST` | `/auth/refresh` | Refresh cookie | Rotate refresh token and create new access token. |
| `POST` | `/auth/logout` | Optional refresh cookie | Revoke refresh-token family and clear cookie. |
| `GET` | `/auth/me` | User | Return current authenticated user. |
| `GET` | `/auth/faculty/profile` | User (Faculty) | Return current authenticated faculty profile. |
| `PUT` | `/auth/updatedetails` | User | Update name, branch, or year. |
| `PUT` | `/auth/updateavatar` | User | Upload avatar image. |

### Register Student Request

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

### Register Faculty Request

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

### Verify OTP Request

```json
{
  "email": "student@example.com",
  "otp": "123456"
}
```

### Login Request

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

## Admin: `/admin`

All admin endpoints require:

```text
Authorization: Bearer <access-token>
```

and the authenticated user must have `role = admin`.

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

### Admin Query Parameters

`GET /admin/users` supports:

| Query | Purpose |
| --- | --- |
| `page` | Page number. |
| `limit` | Page size, max 100. |
| `search` | Search by student name or email. |

## Resources: `/resources`

Resources are admin-managed URL records. Public users can view approved resources.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/resources` | Optional | List resources. Public sees approved only. Admin may filter by status. |
| `POST` | `/resources` | Admin | Create an approved resource record. |
| `GET` | `/resources/:id` | Optional | Get one resource. Public cannot view non-approved resources. |
| `PATCH` | `/resources/:id` | Admin | Update a resource. |
| `DELETE` | `/resources/:id` | Admin | Soft-delete a resource. |

### Resource Query Parameters

| Query | Purpose |
| --- | --- |
| `branch` | Filter by branch. |
| `semester` | Filter by semester. |
| `search` | Search title, subject, or author. |
| `status` | Admin-only status filter. |
| `page`, `limit` | Accepted by validation schema, although current controller returns all matching rows. |

### Create Resource Request

```json
{
  "title": "Unit 1 DBMS Notes",
  "subject": "DBMS",
  "semester": "4",
  "branch": "Computer",
  "type": "pdf",
  "description": "Complete unit 1 notes with examples.",
  "category": "Notes",
  "pattern": "2024",
  "unit": "Unit 1",
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
| `POST` | `/study-materials` | User plus approved faculty check | Upload or submit a study material. |
| `PATCH` | `/study-materials/:id/status` | Admin | Approve or reject a material. |

### Upload Study Material Request

Content type:

```text
multipart/form-data
```

Fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | Yes | Material title. |
| `subject` | Yes | Subject name. |
| `type` | Optional | `PDF`, `PPT`, `DOCX`, `Markdown`, `Video`, or `Notes`. If file is uploaded, type is inferred and must match. |
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

### Update Material Status Request

```json
{
  "status": "approved",
  "reason": "Optional reason when rejected"
}
```

Allowed status values:

- `approved`
- `rejected`

## Syllabus: `/syllabus`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/syllabus` | Public | List all non-deleted syllabus records. |
| `GET` | `/syllabus/:id/file` | Public | Stream the uploaded syllabus file. |
| `POST` | `/syllabus` | Admin | Create syllabus record, optionally with uploaded file. |
| `DELETE` | `/syllabus/:id` | Admin | Soft-delete syllabus record. |

### Create Syllabus JSON Request

```json
{
  "title": "Data Structures and Algorithms",
  "code": "CS401",
  "branch": "Computer",
  "semester": "4",
  "type": "pdf",
  "credits": 4,
  "contentUrl": "https://example.com/cs401.pdf"
}
```

### Create Syllabus Upload Request

Content type:

```text
multipart/form-data
```

Fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | Yes | Course title. |
| `code` | Yes | Subject code. |
| `branch` | Yes | Branch enum. |
| `semester` | Yes | `1` to `8`. |
| `credits` | Yes | Integer from 1 to 10. |
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

## Academic Content: `/subjects` and `/topics`

These endpoints serve the curriculum data (Subjects, Units, Topics).

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/subjects` | Public | Fetch subjects filtered by `branch` and `semester`. |
| `GET` | `/subjects/:id/units` | Public | Get all units (and nested topics) for a given subject. |
| `GET` | `/topics/:id` | Public | Fetch a specific topic's details and markdown content. |

## File Proxy: `/files`

Provides secure streaming of protected or local uploads to the frontend.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/files/:studyMaterialId` | Optional | Stream local file for a study material. Restricts non-approved access to admins. |

## Validation Enums

### Branch

```text
Computer, IT, Civil, Mechanical, Electrical, ENTC
```

### Academic Year

```text
FE, SE, TE, BE
```

### Resource Types

```text
pdf, video, doc, markdown
```

### Resource Categories

```text
Notes, PYQ, Syllabus, Lab Manual, Reference Book, Other
```

### Study Material Types

```text
PDF, PPT, DOCX, Markdown, Video, Notes
```
