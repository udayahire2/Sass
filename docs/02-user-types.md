# User Types and Roles

The application supports three user roles: **student**, **faculty**, and **admin**. Roles are stored in the `users.role` field and enforced by backend middleware.

## Role Overview

| Role    | Main Purpose                                                       | Created Through  | Approval Required            |
| ------- | ------------------------------------------------------------------ | ---------------- | ---------------------------- |
| Student | Consume syllabus and study materials, submit useful content.       | Public signup    | Email OTP only               |
| Faculty | Academic contributor with faculty profile details.                 | Public signup    | Email OTP and admin approval |
| Admin   | Manage users, content, faculty approvals, syllabus, and resources. | Seed/admin setup | Not through public signup    |

## Student

Students are the main consumers of the platform.

### Student Registration Fields

- Full name
- Email
- Password
- Branch: `Computer`, `IT`, `Civil`, `Mechanical`, `Electrical`, `ENTC`
- Year: `FE`, `SE`, `TE`, `BE`

### Student Permissions

Students can:

- Register and verify their email using OTP.
- Login after email verification.
- View public syllabus records.
- Browse static subject/topic study content in the frontend.
- View approved uploaded study materials.
- Search and filter approved uploads.
- Submit PDF, PPT, DOCX, or Markdown study content for admin review.
- Update profile details.
- Upload/update avatar image.

### Student Restrictions

Students cannot:

- Access the admin dashboard.
- Approve or reject uploaded content.
- Create or delete syllabus records.
- Create or delete admin-managed resources.
- Approve faculty accounts.

## Faculty

Faculty users represent academic staff. They register separately from students and provide professional details.

### Faculty Registration Fields

- Full name
- Email
- Password
- Designation
- Department
- College name
- Subjects taught

### Faculty Approval Flow

1. Faculty signs up.
2. Faculty verifies email through OTP.
3. Faculty account is stored with `is_approved = 0`.
4. Admin reviews the faculty request from the Faculty Manager screen.
5. Admin approves or revokes faculty access.

### Faculty Permissions

Faculty can:

- Register and verify email using OTP.
- Login after email verification.
- Access the faculty dashboard route after login.
- Submit study content after admin approval.

### Faculty Restrictions

Unapproved faculty can login, but protected faculty contribution actions are blocked by the backend through `requireApprovedFaculty`.

Faculty cannot:

- Access admin-only pages.
- Approve content.
- Manage students.
- Manage syllabus or resources unless their role is changed to admin.

## Admin

Admins are privileged users who manage the product. The backend includes a `seed:admin` script to create an admin account using environment variables.

### Admin Permissions

Admins can:

- View dashboard statistics.
- View and update admin profile.
- Search and manage student accounts.
- Delete non-admin users through soft delete.
- View all faculty.
- View pending faculty.
- Approve faculty accounts.
- Revoke faculty approval.
- View pending, approved, and rejected uploaded study materials.
- Approve or reject uploaded study materials.
- Create and delete syllabus entries.
- Create and delete admin-managed resource links.

### Admin Restrictions

Admins cannot be deleted through the student deletion endpoint. The backend explicitly blocks deletion of admin accounts through `DELETE /api/v1/admin/users/:id`.

## Authorization Middleware

| Middleware | Purpose |
| --- | --- |
| `protect` / `loadAuthenticatedUser` | Requires a valid access token and loads `req.user`. |
| `optionalAuth` | Loads the user if a valid token exists but allows public access otherwise. |
| `authorize('admin')` | Allows only admin users. |
| `requireApprovedFaculty` | Blocks faculty users whose account is not approved. Students and admins pass this check. |

## Role-Based Feature Matrix

| Feature | Student | Faculty | Admin |
| --- | --- | --- | --- |
| Register publicly | Yes | Yes | No |
| Email OTP verification | Yes | Yes | Admin is seeded |
| Login | Yes | Yes | Yes |
| View syllabus | Yes | Yes | Yes |
| View approved study uploads | Yes | Yes | Yes |
| Upload study material | Yes | Yes, after approval | Yes |
| Approve study material | No | No | Yes |
| Manage resources | No | No | Yes |
| Manage syllabus | No | No | Yes |
| Manage students | No | No | Yes |
| Approve faculty | No | No | Yes |

## Mentor Notes

The role system is clear and practical. Students are the primary audience, faculty are controlled contributors, and admins act as moderators and managers. The biggest security boundary is the admin role, because all management APIs use `protect` plus `authorize('admin')`.
