# Authentication

The active application uses email/password login, email OTP verification, JWT access tokens, and rotating refresh tokens.

## Main Authentication Files

| File | Purpose |
| --- | --- |
| `backend/src/controllers/authController.js` | Registration, login, OTP, sessions, logout, profile, avatar. |
| `backend/src/middlewares/authMiddleware.js` | Token loading, optional auth, role authorization, approved-faculty check. |
| `backend/src/utils/authTokens.js` | Password hashing, token hashing, JWT signing/verification, OTP generation. |
| `backend/src/utils/cookies.js` | Refresh-token cookie parsing, setting, and clearing. |
| `backend/src/validation/schemas.js` | Auth request validation. |
| `app/src/hooks/use-local-auth.ts` | Frontend local auth state and session verification. |
| `app/src/components/auth/RoleGuard.tsx` | Redirects authenticated admins/faculty away from the student home route. |

## Registration Flow

1. User opens `/signup`.
2. User selects `student` or `faculty`.
3. Frontend submits data to `POST /api/v1/auth/register`.
4. Backend validates the request with Zod.
5. Backend rejects duplicate emails.
6. Backend hashes the password with bcrypt.
7. Backend inserts a user row.
8. Faculty signup also inserts rows into `faculty_subjects`.
9. Student accounts start with `is_approved = 1`; faculty accounts start with `is_approved = 0`.
10. Backend creates a 6-digit OTP, stores only its hash, and enqueues an email job.
11. Frontend redirects to `/verify-otp?email=...`.

## OTP Verification Flow

1. User submits email and 6-digit OTP.
2. Frontend calls `POST /api/v1/auth/verify-otp`.
3. Backend finds the latest unused OTP for the email and `account_verification` purpose.
4. Backend checks expiry.
5. Backend hashes the submitted OTP and compares it with `otp_hash`.
6. Backend marks the OTP as used.
7. Backend sets `users.is_verified = 1`.
8. Backend creates a login session immediately.
9. Frontend stores the access token and user object.
10. Frontend redirects by role:
    - Admin to `/admin/dashboard`
    - Faculty to `/dashboard/faculty`
    - Student to `/`

OTP details:

- Length: 6 digits
- Expiry: 10 minutes
- Purpose: `account_verification`
- Stored value: hash only

Development note:

- OTPs are printed to the server console.
- Email job records are created, but the server currently does not start the background job worker.

## Login Flow

1. User submits email and password.
2. Frontend calls `POST /api/v1/auth/login`.
3. Backend validates the request.
4. Backend finds the user by email.
5. Backend compares the password with bcrypt.
6. If the account is not verified, backend creates a fresh OTP and rejects login with a verification message.
7. Backend creates an access token and refresh token.
8. Backend stores the refresh-token hash in SQLite.
9. Backend sets the raw refresh token in an HTTP-only cookie.
10. Frontend stores `token` and `user` in `localStorage`.
11. Frontend redirects by role.

## Access Tokens

Access tokens are JWTs signed with `JWT_ACCESS_SECRET`, falling back to `JWT_SECRET`.

Payload shape:

```json
{
  "sub": "user-id",
  "role": "student",
  "approved": true,
  "type": "access"
}
```

Default expiry:

```text
15m
```

Frontend sends access tokens as:

```text
Authorization: Bearer <token>
```

## Refresh Tokens

Refresh tokens are JWTs signed with `JWT_REFRESH_SECRET`, falling back to `JWT_SECRET`.

Default expiry:

```text
7d
```

The raw refresh token is stored in an HTTP-only cookie named by `REFRESH_COOKIE_NAME`, defaulting to:

```text
studyhub_refresh_token
```

The database stores only a hash of the refresh token in `refresh_tokens.token_hash`.

## Refresh Rotation

`POST /api/v1/auth/refresh`:

1. Reads the refresh token from the cookie.
2. Verifies JWT signature and expiry.
3. Finds the matching token hash.
4. Rejects revoked or expired tokens.
5. Creates a new access token.
6. Creates a new refresh token in the same family.
7. Revokes the previous refresh token and links it to the replacement.

If a token is missing, invalid, expired, or no longer recognized, the backend clears the cookie. For missing database rows or revoked tokens, it also revokes the family where possible.

## Logout Flow

1. Client calls `POST /api/v1/auth/logout`.
2. Backend reads the refresh token from the cookie.
3. Backend finds its token family if possible.
4. Backend revokes the whole family.
5. Backend clears the refresh cookie.

## Frontend Session Handling

The frontend stores:

- `token` in `localStorage`
- `user` in `localStorage`

`useLocalAuth()`:

1. Reads stored token and user.
2. Optimistically sets user state from storage.
3. Calls `GET /api/v1/auth/me`.
4. Refreshes the local user object if the token is valid.
5. Logs out and navigates to `/login` if the token is invalid.
6. Listens for an `auth-change` event so profile/avatar updates can refresh UI state.

## Profile and Avatar

Profile update:

```text
PUT /api/v1/auth/updatedetails
```

Allowed fields:

- `name`
- `branch`
- `year`

Avatar update:

```text
PUT /api/v1/auth/updateavatar
```

Rules:

- Requires authentication.
- Expects multipart field `avatar`.
- Allows MIME types `image/jpeg`, `image/png`, `image/webp`, and `image/gif`.
- Maximum size is 5 MB.
- Stores images in `backend/uploads/avatars/`.
- Deletes the previous local avatar file if it was also under `/uploads/avatars/`.

## Authorization Rules

| Middleware | Description |
| --- | --- |
| `protect` / `loadAuthenticatedUser` | Requires valid access token and loads user. |
| `optionalAuth` | Allows public access but loads user if a valid token exists. |
| `authorize('admin')` | Allows only admins. |
| `requireApprovedFaculty` | Blocks faculty users whose `isApproved` flag is false. |

## Security Notes

- Passwords are hashed with bcrypt with at least 12 rounds.
- Access and refresh tokens can use separate secrets.
- Refresh tokens are stored as hashes.
- Refresh cookies are HTTP-only.
- Production cookies use secure settings.
- Admin APIs require both authentication and admin authorization.
- The current frontend keeps the access token in `localStorage`; a more hardened production design would keep access tokens in memory and rely on refresh cookies to restore sessions.
