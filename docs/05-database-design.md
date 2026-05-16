# Database Design

The active backend uses **SQLite**, not MongoDB. The schema is defined in migration files under `backend/migrations`.

Key migrations:

| Migration | Purpose |
| --- | --- |
| `001_initial.up.sql` | Core users, subjects, syllabus, resources, study materials, sessions, OTPs, jobs, and indexes. |
| `002_study_content_uploads.up.sql` | Normalizes study-material upload metadata. |
| `003_subjects_units_topics.up.sql` | Adds `units` and `topics` for academic content. |
| `004_material_feedback.up.sql` | Adds faculty feedback/rating records. |
| `005_bookmarks.up.sql` | Adds user bookmarks for study materials. |
| `006_study_content.up.sql` | Additional study content structures. |
| `007_syllabus_year.up.sql` | Adds academic year to syllabus records. |
| `008_platform_feedback.up.sql` | Adds platform feedback table for bug reports and feature requests. |
| `009_resource_file_uploads.up.sql` | Adds file upload support columns to resources table. |

## Database Location

Default database file:

```text
backend/data/studyhub.sqlite
```

Override with:

```text
DB_PATH=./custom/path.sqlite
```

## Main Tables

### `users`

Stores student, faculty, and admin accounts.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `first_name`, `last_name` | User display name parts. |
| `email` | Unique login email. |
| `password_hash` | bcrypt password hash. |
| `avatar_url` | External avatar URL or local `/uploads/avatars/...` path. |
| `role` | `student`, `faculty`, or `admin`. |
| `is_verified` | Email OTP verification flag. |
| `is_approved` | Faculty approval flag; students/admins are approved by default. |
| `branch`, `academic_year` | Student academic metadata. |
| `designation`, `department`, `college_name` | Faculty metadata. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

### `faculty_subjects`

Stores one subject row per faculty subject.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `faculty_user_id` | References `users.id`. |
| `subject_name` | Subject taught by the faculty member. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

### `subjects`

Stores academic subject metadata used by syllabus and study browsing.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `code` | Subject code. |
| `title` | Subject title. |
| `branch` | Academic branch. |
| `semester` | Semester number. |
| `credits` | Credit count. |
| `description` | Optional description. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

Constraint:

- `code`, `branch`, and `semester` are unique together.

Current sources:

- `backend/src/seeds/seedSubjects.js` seeds this table from `app/src/data/study-data.ts`.
- `createSyllabus()` also calls `ensureSubject()` to create or reuse a matching subject row.

### `units`

Stores unit-level subject structure.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `subject_id` | References `subjects.id`. |
| `unit_number` | Unit order. |
| `title` | Unit title. |
| `description` | Optional unit description. |
| `created_at`, `deleted_at` | Lifecycle timestamps. |

Constraint:

- `subject_id` and `unit_number` are unique together.

### `topics`

Stores individual topic content under units.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `unit_id` | References `units.id`. |
| `title` | Topic title. |
| `content_markdown` | Topic Markdown rendered in the frontend. |
| `video_url` | Optional video URL. |
| `created_at`, `deleted_at` | Lifecycle timestamps. |

### `syllabi`

Stores syllabus records and their content references.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `subject_id` | Optional reference to `subjects.id`. |
| `title` | Course title. |
| `code` | Course/subject code. |
| `branch` | Branch name. |
| `semester` | Semester as text, including `all`. |
| `type` | `pdf` or `markdown`. |
| `credits` | Currently stored as `0` for newly created records. |
| `content_url` | PDF path or Markdown content. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

Behavior:

- PDF uploads store paths such as `/uploads/syllabus/file.pdf`.
- Markdown/text uploads store the file text directly in `content_url`.

### `resources`

Stores admin-managed URL resources or uploaded files.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `subject_id` | Optional reference to `subjects.id`. |
| `title`, `subject` | Resource title and subject label. |
| `semester`, `branch`, `academic_year` | Academic classification. |
| `type` | `pdf`, `video`, `doc`, or `markdown`. |
| `description` | Resource description. |
| `category` | `Notes`, `PYQ`, `Syllabus`, `Lab Manual`, `Reference Book`, or `Other`. |
| `pattern`, `unit` | Optional tags/metadata. |
| `author` | Author/source label. |
| `url` | External resource URL (if not using file upload). |
| `file_path` | Local upload path such as `/uploads/resources/file.pdf` (if uploaded). |
| `original_filename` | Original uploaded filename. |
| `mime_type` | Uploaded file MIME type. |
| `file_size` | File size in bytes. |
| `status` | `pending`, `approved`, or `rejected`. Admin-created records default to `approved`. |
| `created_by_user_id`, `approved_by_user_id` | User/admin references. |
| `approved_at`, `rejection_reason` | Moderation metadata. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

### `study_materials`

Stores user-submitted study uploads and links.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `subject_id` | Optional reference to `subjects.id`. |
| `title`, `subject` | Material title and subject label. |
| `type` | `PDF`, `PPT`, `DOCX`, `Markdown`, `Video`, or `Notes`. |
| `url` | Optional external URL. |
| `file_path` | Local upload path such as `/uploads/file.pdf`. |
| `original_filename` | Original uploaded filename. |
| `mime_type` | Uploaded file MIME type. |
| `file_size` | File size in bytes. |
| `status` | `pending`, `approved`, or `rejected`. |
| `author` | Credit name shown in the UI. |
| `uploader_user_id` | Uploading user. |
| `approved_by_user_id`, `approved_at`, `rejection_reason` | Review metadata. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

This table powers public approved uploads, admin approval queues, profile upload history, bookmarks, and faculty stats.

### `bookmarks`

Stores saved study materials for users.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `user_id` | References `users.id`. |
| `study_material_id` | References `study_materials.id`. |
| `created_at` | Bookmark timestamp. |

Constraint:

- One bookmark per user/material pair.

### `material_feedback`

Stores faculty/admin feedback on approved study materials.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `study_material_id` | References `study_materials.id`. |
| `reviewer_user_id` | References `users.id`. |
| `feedback_text` | Review text. |
| `rating` | Integer from 1 to 5. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

Constraint:

- One feedback row per reviewer/material pair.

### `platform_feedback`

Stores user-submitted platform feedback (bug reports, feature requests, general feedback).

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `user_id` | References `users.id`. |
| `type` | Feedback type: `bug`, `feature`, `general`, or `other`. |
| `message` | Feedback text/description. |
| `status` | `pending`, `reviewed`, or `resolved`. Defaults to `pending`. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

### `refresh_tokens`

Stores rotating refresh-token sessions.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `user_id` | References `users.id`. |
| `family_id` | Groups rotated tokens. |
| `token_hash` | Hash of raw refresh token. |
| `user_agent`, `ip_address` | Request metadata. |
| `expires_at`, `revoked_at` | Session validity timestamps. |
| `replaced_by_token_id` | Links old token to replacement token. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

### `email_otps`

Stores hashed OTPs for email verification.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `user_id` | References `users.id`. |
| `email` | Target email. |
| `purpose` | Currently `account_verification`. |
| `otp_hash` | Hash of the 6-digit OTP. |
| `expires_at` | OTP expiry. |
| `used_at` | Verification timestamp. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

### `jobs`

Stores background job records.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `type` | Job type, such as `email.send`. |
| `payload_json` | Serialized payload. |
| `status` | `pending`, `processing`, `completed`, or `failed`. |
| `attempts`, `max_attempts` | Retry tracking. |
| `available_at`, `processed_at` | Scheduling/completion timestamps. |
| `error_message` | Last failure message. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

Implementation caveat:

- Job rows are created, but the local server currently does not start the worker loop.

## Indexes

The schema includes indexes for:

- Users by role and email.
- Faculty subjects by faculty user.
- Subjects by branch and semester.
- Syllabus by branch and semester.
- Resources by branch, semester, year, status, and creation time.
- Study materials by status and creation time.
- Refresh tokens by user and family.
- OTPs by email and purpose.
- Jobs by status and availability.
- Feedback by material and reviewer.

## Entity Relationships

| Relationship | Type |
| --- | --- |
| User to faculty subjects | One-to-many |
| Subject to syllabus | One-to-many, optional |
| Subject to units | One-to-many |
| Unit to topics | One-to-many |
| Subject to resources | One-to-many, optional |
| Subject to study materials | One-to-many, optional |
| User to uploaded study materials | One-to-many |
| User to bookmarks | One-to-many |
| Study material to bookmarks | One-to-many |
| Study material to feedback | One-to-many |
| User to material feedback | One-to-many |
| User to platform feedback | One-to-many |
| User to refresh tokens | One-to-many |
| User to OTPs | One-to-many |

## Soft Delete Strategy

Most primary tables use `deleted_at` rather than physical deletion. Queries commonly include:

```sql
WHERE deleted_at IS NULL
```

The `bookmarks` table is an exception: bookmark toggling physically deletes the bookmark row.
