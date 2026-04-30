# Database Design

The current backend uses **SQLite**, not MongoDB. The schema is defined through migration files in `backend/migrations`.

The main migration is:

```text
backend/migrations/001_initial.up.sql
```

The upload metadata migration is:

```text
backend/migrations/002_study_content_uploads.up.sql
```

## Database Location

By default, the database file is:

```text
backend/data/studyhub.sqlite
```

This can be changed with the `DB_PATH` environment variable.

## Main Tables

### 1. `users`

Stores all student, faculty, and admin accounts.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `first_name` | User first name. |
| `last_name` | User last name. |
| `email` | Unique login email. |
| `password_hash` | bcrypt password hash. |
| `avatar_url` | External avatar URL or local `/uploads/avatars/...` path. |
| `role` | `student`, `faculty`, or `admin`. |
| `is_verified` | Email OTP verification flag. |
| `is_approved` | Faculty approval flag. Students default to approved. |
| `branch` | Student branch. |
| `academic_year` | Student year, such as `FE`, `SE`, `TE`, `BE`. |
| `designation` | Faculty designation. |
| `department` | Faculty department. |
| `college_name` | Faculty college name. |
| `created_at` | Creation timestamp. |
| `updated_at` | Last update timestamp. |
| `deleted_at` | Soft delete timestamp. |

### 2. `faculty_subjects`

Stores subjects linked to faculty users.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `faculty_user_id` | References `users.id`. |
| `subject_name` | Subject taught by the faculty member. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

Relationship:

- One faculty user can have many faculty subject rows.

### 3. `subjects`

Stores academic subject metadata.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `code` | Subject code. |
| `title` | Subject title. |
| `branch` | Academic branch. |
| `semester` | Semester number. |
| `credits` | Subject credits. |
| `description` | Optional subject description. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

Constraint:

- `code`, `branch`, and `semester` are unique together.

Current use:

- Syllabus creation calls `ensureSubject()` to create or reuse a matching subject row.

### 4. `syllabi`

Stores syllabus content or syllabus file references.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `subject_id` | Optional reference to `subjects.id`. |
| `title` | Course or syllabus title. |
| `code` | Subject code. |
| `branch` | Branch name. |
| `semester` | Semester as text. |
| `type` | `pdf` or `markdown`. |
| `credits` | Course credits. |
| `content_url` | PDF path or Markdown content. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

Behavior:

- PDF syllabus uploads store a path like `/uploads/syllabus/file.pdf`.
- Markdown or text syllabus uploads store the file content directly in `content_url`.

### 5. `resources`

Stores admin-managed resource links.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `subject_id` | Optional reference to `subjects.id`. |
| `title` | Resource title. |
| `subject` | Subject name. |
| `semester` | Semester value. |
| `branch` | Branch name. |
| `type` | `pdf`, `video`, `doc`, or `markdown`. |
| `description` | Resource description. |
| `category` | `Notes`, `PYQ`, `Syllabus`, `Lab Manual`, `Reference Book`, or `Other`. |
| `pattern` | Optional exam pattern or related tag. |
| `unit` | Optional unit reference. |
| `academic_year` | `FE`, `SE`, `TE`, or `BE`. |
| `author` | Creator/author name. |
| `url` | External resource URL. |
| `status` | `pending`, `approved`, or `rejected`. Admin-created records default to `approved`. |
| `created_by_user_id` | Admin/user who created the resource. |
| `approved_by_user_id` | Admin who approved it. |
| `approved_at` | Approval timestamp. |
| `rejection_reason` | Optional rejection reason. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

### 6. `study_materials`

Stores user-submitted study uploads and links.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `subject_id` | Optional reference to `subjects.id`. |
| `title` | Upload title. |
| `subject` | Subject name. |
| `type` | `PDF`, `PPT`, `DOCX`, `Markdown`, `Video`, or `Notes`. |
| `url` | Optional external URL. |
| `file_path` | Local upload path, for example `/uploads/file.pdf`. |
| `original_filename` | Original file name uploaded by user. |
| `mime_type` | Uploaded file MIME type. |
| `file_size` | File size in bytes. |
| `status` | `pending`, `approved`, or `rejected`. |
| `author` | Credit name shown in UI. |
| `uploader_user_id` | User who uploaded the content. |
| `approved_by_user_id` | Admin who reviewed it. |
| `approved_at` | Approval timestamp. |
| `rejection_reason` | Optional rejection reason. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

This table powers the admin approval workflow and the public approved uploads section.

### 7. `refresh_tokens`

Stores refresh-token sessions.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `user_id` | References `users.id`. |
| `family_id` | Groups related refresh tokens in a rotating session family. |
| `token_hash` | SHA-256 hash of the refresh token. |
| `user_agent` | Browser/client information. |
| `ip_address` | Request IP address. |
| `expires_at` | Refresh token expiry timestamp. |
| `revoked_at` | Revocation timestamp. |
| `replaced_by_token_id` | Next refresh token in the rotation chain. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

Security behavior:

- Raw refresh tokens are never stored.
- Reused or invalid refresh tokens can revoke the whole token family.

### 8. `email_otps`

Stores OTP records for email verification.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `user_id` | References `users.id`. |
| `email` | Target email address. |
| `purpose` | Current purpose is `account_verification`. |
| `otp_hash` | SHA-256 hash of the OTP. |
| `expires_at` | OTP expiry timestamp. |
| `used_at` | Timestamp when OTP was used. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

OTP behavior:

- OTP is 6 digits.
- OTP expires after 10 minutes.
- New OTP creation soft-deletes older unused OTPs for the same email and purpose.

### 9. `jobs`

Stores background jobs.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `type` | Job type, such as `email.send`. |
| `payload_json` | Serialized job payload. |
| `status` | `pending`, `processing`, `completed`, or `failed`. |
| `attempts` | Number of processing attempts. |
| `max_attempts` | Maximum retries. |
| `available_at` | When the job can be processed. |
| `processed_at` | Completion timestamp. |
| `error_message` | Last failure message. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle timestamps. |

### 10. `units`

Stores syllabus units linked to a subject.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `subject_id` | References `subjects.id`. |
| `unit_number` | Order or unit index. |
| `title` | Unit title. |
| `description` | Optional description of the unit. |
| `created_at`, `deleted_at` | Lifecycle timestamps. |

### 11. `topics`

Stores individual topics linked to a unit.

| Column | Meaning |
| --- | --- |
| `id` | UUID primary key. |
| `unit_id` | References `units.id`. |
| `title` | Topic title. |
| `content_markdown` | Markdown content for the topic. |
| `video_url` | Optional YouTube video URL. |
| `created_at`, `deleted_at` | Lifecycle timestamps. |

## Indexes

The schema includes indexes for common lookups:

- Users by role and soft-delete status.
- Users by email and soft-delete status.
- Faculty subjects by faculty user.
- Subjects by branch and semester.
- Syllabus by branch and semester.
- Resources by branch, semester, academic year, status, and created date.
- Study materials by status and created date.
- Refresh tokens by user and family.
- OTPs by email and purpose.
- Jobs by status and availability time.

## Entity Relationships

| Relationship | Type |
| --- | --- |
| User to faculty subjects | One-to-many |
| Subject to syllabus | One-to-many |
| Subject to units | One-to-many |
| Unit to topics | One-to-many |
| Subject to resources | One-to-many, optional |
| Subject to study materials | One-to-many, optional |
| User to uploaded study materials | One-to-many |
| User to refresh tokens | One-to-many |
| User to OTPs | One-to-many |
| Admin user to approvals | One-to-many through `approved_by_user_id` |

## Soft Delete Strategy

Most main tables use `deleted_at` instead of physically deleting rows. Queries usually filter with:

```sql
WHERE deleted_at IS NULL
```

This keeps history available and avoids accidental permanent data loss.
