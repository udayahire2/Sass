# User Types and Roles

The application supports three roles: **student**, **faculty**, and **admin**. Roles are stored in `users.role` and enforced in the backend by authentication middleware.

## Role Overview

| Role | Created through | Approval required | Main purpose |
| --- | --- | --- | --- |
| Student | Public signup | Email OTP | Browse syllabus/materials, upload content, manage profile and bookmarks. |
| Faculty | Public signup | Email OTP plus admin approval | Contribute approved academic content and review materials. |
| Admin | Seeded from environment/script | Not public | Manage users, faculty access, syllabus, resources, and approvals. |

## Student

Students are the primary consumers of the platform.

Registration fields:

- Full name
- Email
- Password
- Branch: `Computer`, `IT`, `Civil`, `Mechanical`, `Electrical`, `ENTC`
- Year: `FE`, `SE`, `TE`, `BE`

Students can:

- Register and verify email with OTP.
- Log in after verification.
- View syllabus records.
- Browse seeded subjects, units, and topics from the backend.
- View approved study-material uploads.
- Search/filter approved uploads.
- Bookmark approved uploads.
- Submit study material for admin review.
- Submit platform feedback (bug reports, feature requests).
- Update profile name, branch, year, and avatar.
- View their own upload status history from the profile page.

Students cannot:

- Access admin APIs.
- Approve or reject submitted content.
- Create/delete syllabus records.
- Create/delete admin resource links.
- Approve or revoke faculty access.

## Faculty

Faculty users represent academic staff and controlled contributors.

Registration fields:

- Full name
- Email
- Password
- Designation
- Department
- College name
- Subjects taught

Faculty flow:

1. Faculty signs up.
2. Backend stores the user with `is_approved = 0`.
3. Faculty verifies email by OTP.
4. Faculty can log in and view the faculty dashboard.
5. Admin approves or revokes faculty access from `/admin/faculty`.

Faculty can:

- Register and verify email.
- Log in after verification.
- View faculty profile/status on `/dashboard/faculty`.
- Upload study material after admin approval.
- View contribution stats for their own uploads.
- See their pending, approved, and rejected uploads.
- Give or update feedback and 1-5 star ratings on approved study materials.

Faculty restrictions:

- Unapproved faculty are blocked by `requireApprovedFaculty` on contribution routes.
- Faculty are not admins and cannot manage students, syllabus, resources, or approvals.

## Admin

Admins are privileged users. The active backend can create a default admin on startup when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured, and also includes `scripts/seedAdmin.js`.

Admins can:

- View dashboard statistics.
- Search/list students.
- Soft-delete non-admin users.
- View pending and all faculty.
- Approve faculty users.
- Revoke faculty approval.
- View pending, approved, and rejected study materials.
- Approve or reject uploaded study materials.
- Preview uploaded files through file proxy endpoints.
- Create and delete syllabus records.
- Create, update, and delete resource links and file uploads through the API.
- Review, update status, and delete user platform feedback.
- Update admin profile fields through the API.

Admin restrictions:

- Admin users cannot be deleted through `DELETE /api/v1/admin/users/:id`.
- Admin creation is not exposed through public signup.

## Authorization Middleware

| Middleware | Purpose |
| --- | --- |
| `loadAuthenticatedUser` / `protect` | Requires a valid access token and loads `req.user`. |
| `optionalAuth` | Attempts to load a valid user but allows public access. |
| `authorize('admin')` | Allows only admin users. |
| `requireApprovedFaculty` | Blocks faculty users whose account is not approved. Students and admins pass this check. |

## Feature Matrix

| Feature | Student | Faculty | Admin |
| --- | --- | --- | --- |
| Public registration | Yes | Yes | No |
| OTP verification | Yes | Yes | Seeded admin is already verified |
| Login | Yes | Yes | Yes |
| View syllabus | Yes | Yes | Yes |
| Browse subject/unit/topic content | Yes | Yes | Yes |
| View approved uploads | Yes | Yes | Yes |
| Bookmark uploads | Yes | Yes | Yes |
| Upload study material | Yes | Yes, after approval | Yes |
| Give material feedback | No | Yes, after approval | Yes |
| Submit platform feedback | Yes | Yes | Yes |
| Approve study material | No | No | Yes |
| Manage platform feedback | No | No | Yes |
| Manage resources | No | No | Yes |
| Manage syllabus | No | No | Yes |
| Manage students | No | No | Yes |
| Approve faculty | No | No | Yes |

## Frontend Routing Notes

- `/` is wrapped in `RoleGuard`, which redirects authenticated admins to `/admin/dashboard` and faculty to `/dashboard/faculty`.
- `/admin/*` is guarded in `AdminLayout` using the locally stored user/token plus backend-protected API calls.
- `/dashboard/faculty` loads authenticated user data and faculty stats from protected endpoints; upload access is ultimately enforced by the backend.
