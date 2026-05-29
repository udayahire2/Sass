# User Types And Roles

NMU Study Hub has three product roles:

- Student
- Faculty
- Admin

Roles are stored in `users.role` and enforced by backend middleware. Frontend layouts add user experience level redirects, but backend authorization is the actual security boundary.

## Role Overview

| Role | Created through | Verification | Approval | Main purpose |
| --- | --- | --- | --- | --- |
| Student | Public signup | Email OTP | Auto-approved | Browse, bookmark, upload, take notes, manage profile. |
| Faculty | Public signup | Email OTP | Admin approval required for contribution actions | Upload material, track contributions, review approved material. |
| Admin | Seeded through env/script | Pre-verified | Pre-approved | Manage content, users, faculty access, and platform operations. |

## Student

### Registration Fields

- Full name
- Email
- Password
- Branch
- Academic year

### Student Capabilities

Students can:

- Register and verify email.
- Log in and manage profile.
- Upload avatar image.
- Browse syllabus, subjects, units, and topics.
- View approved study materials.
- Bookmark approved study materials.
- Upload study material for moderation.
- View personal upload history.
- Submit platform feedback.
- Create and manage notes.

Students cannot:

- Access admin APIs.
- Approve or reject content.
- Manage syllabus and resource records.
- Manage users or faculty approval.
- Submit material feedback ratings, which are faculty/admin focused.

## Faculty

### Registration Fields

- Full name
- Email
- Password
- Designation
- Department
- College name
- Subjects taught

### Faculty Approval Flow

1. Faculty submits signup form.
2. Backend stores `is_approved = 0`.
3. Faculty verifies email with OTP.
4. Faculty can log in and see faculty dashboard.
5. Admin approves faculty from `/admin/faculty`.
6. Approved faculty can upload material and submit material feedback.

### Faculty Capabilities

Faculty can:

- Log in and manage profile.
- See contribution status.
- Upload study material after approval.
- View own uploads.
- Review approved study material with feedback and rating.

Faculty cannot:

- Manage users.
- Approve or reject platform uploads.
- Manage syllabus/resources as admin.
- Access admin-only data.

## Admin

Admins are privileged operators. The active backend can create a default admin on startup when `ADMIN_EMAIL` and `ADMIN_PASSWORD` exist. `backend/scripts/seedAdmin.js` is also available.

Admins can:

- View dashboard stats.
- List/search students.
- Soft-delete non-admin users.
- Review pending, approved, and rejected materials.
- Approve or reject study material submissions.
- Preview uploaded files for moderation.
- Create/update/delete resources through the API.
- Create/delete syllabus records.
- Approve or revoke faculty access.
- Review and manage platform feedback.
- Edit topics through the topic editor route.

Admins cannot:

- Be deleted through the student deletion endpoint.
- Be created through public signup.

## Authorization Middleware

| Middleware | Location | Purpose |
| --- | --- | --- |
| `protect` / `loadAuthenticatedUser` | `backend/src/middlewares/authMiddleware.js` | Requires a valid access token and loads `req.user`. |
| `optionalAuth` | Same file | Loads user if token exists but allows public access. |
| `authorize('admin')` | Same file | Restricts route to admin users. |
| `requireApprovedFaculty` | Same file | Blocks unapproved faculty while allowing students/admins. |

## Permission Matrix

| Feature | Student | Faculty | Admin |
| --- | --- | --- | --- |
| Signup | Yes | Yes | No |
| OTP verification | Yes | Yes | Seeded |
| Login | Yes | Yes | Yes |
| View syllabus | Yes | Yes | Yes |
| Browse academic topics | Yes | Yes | Yes |
| View approved uploads | Yes | Yes | Yes |
| Bookmark uploads | Yes | Yes | Yes |
| Upload study material | Yes | Yes, after approval | Yes |
| Create notes | Yes | Currently possible if route is available and authenticated | Currently possible if route is available and authenticated |
| Give material feedback | No | Yes, after approval | Yes |
| Submit platform feedback | Yes | Yes | Yes |
| Manage platform feedback | No | No | Yes |
| Approve study material | No | No | Yes |
| Manage syllabus/resources | No | No | Yes |
| Manage students/faculty | No | No | Yes |

## Route Access Notes

| Route group | Current guard |
| --- | --- |
| `/` | `RoleGuard` redirects admin/faculty away from home. |
| `/admin/*` | `AdminLayout` checks local user state; backend APIs enforce admin role. |
| `/dashboard/faculty/*` | `FacultyLayout` checks local user state; backend APIs enforce role and approval. |
| `/notes` | Requires authenticated API calls; frontend route itself is not wrapped by a dedicated guard. |
| `/add-study-content` | UI is reachable; backend enforces auth and faculty approval. |

## Launch Recommendation

Before launch, add dedicated route guards for:

- Authenticated-only pages.
- Student-only experiences.
- Faculty-only dashboard pages.
- Admin-only pages.

The route guard should verify the server session or attempt refresh before trusting `localStorage`.
