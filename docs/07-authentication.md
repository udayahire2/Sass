# Authentication

The application uses email/password login, email OTP verification, JWT access tokens, and rotating refresh tokens.

## Main Authentication Files

| File | Purpose |
| --- | --- |
| `backend/src/controllers/authController.js` | Registration, login, OTP, sessions, logout, profile, avatar. |
| `backend/src/middlewares/authMiddleware.js` | Token loading, role authorization, approved-faculty check. |
| `backend/src/utils/authTokens.js` | Password hashing, token hashing, JWT signing/verification, OTP generation. |
| `backend/src/utils/cookies.js` | Refresh-token cookie parsing and setting. |
| `backend/src/validation/schemas.js` | Auth request validation. |
| `app/src/hooks/use-local-auth.ts` | Frontend local auth state and session verification. |

## Registration Flow

1. User opens `/signup`.
2. User selects `student` or `faculty`.
3. Frontend submits registration data to `POST /api/v1/auth/register`.
4. Backend validates the request using Zod.
5. Backend checks if email already exists.
6. Backend hashes the password with bcrypt.
7. Backend inserts the user into `users`.
8. If the user is faculty, backend also inserts their subjects into `faculty_subjects`.
9. Backend creates a 6-digit OTP.
10. Backend stores only the hashed OTP in `email_otps`.
11. Backend enqueues an `email.send` job.
12. Frontend redirects the user to `/verify-otp`.

## OTP Verification Flow

1. User submits email and 6-digit OTP.
2. Frontend calls `POST /api/v1/auth/verify-otp`.
3. Backend finds the latest unused OTP for that email and purpose.
4. Backend checks OTP expiry.
5. Backend hashes submitted OTP and compares it with stored `otp_hash`.
6. Backend marks OTP as used.
7. Backend updates `users.is_verified` to `1`.
8. Backend creates a login session immediately.
9. Frontend stores access token and user data.

OTP details:

- OTP length: 6 digits.
- OTP expiry: 10 minutes.
- Purpose: `account_verification`.
- Only hashed OTP values are stored.

## Login Flow

1. User submits email and password.
2. Frontend calls `POST /api/v1/auth/login`.
3. Backend validates request body.
4. Backend finds user by email.
5. Backend compares password with bcrypt.
6. Backend blocks unverified email accounts and sends a fresh OTP.
7. Backend creates an access token and refresh token.
8. Backend stores the refresh-token hash in SQLite.
9. Backend sets the raw refresh token in an HTTP-only cookie.
10. Frontend stores the access token and user object in `localStorage`.
11. Frontend redirects:
    - Admin to `/admin/dashboard`
    - Faculty to `/dashboard/faculty`
    - Student to `/`

## Access Tokens

Access tokens are JWTs signed with `JWT_ACCESS_SECRET` or fallback `JWT_SECRET`.

Payload contains:

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

The frontend sends access tokens as:

```text
Authorization: Bearer <token>
```

## Refresh Tokens

Refresh tokens are JWTs signed with `JWT_REFRESH_SECRET` or fallback `JWT_SECRET`.

Default expiry:

```text
7d
```

The raw refresh token is stored in an HTTP-only cookie named by `REFRESH_COOKIE_NAME`, default:

```text
studyhub_refresh_token
```

The database stores only `hashToken(refreshToken)` in `refresh_tokens.token_hash`.

## Refresh Rotation

`POST /api/v1/auth/refresh` performs token rotation:

1. Backend reads refresh token from cookie.
2. Backend verifies JWT signature and expiry.
3. Backend finds matching hash in `refresh_tokens`.
4. Backend rejects revoked or expired tokens.
5. Backend creates a new access token.
6. Backend creates a new refresh token in the same token family.
7. Backend revokes the previous refresh token and links it to the replacement.

If a refresh token is missing, invalid, expired, or reused, the backend can revoke the whole token family.

## Logout Flow

1. Frontend or client calls `POST /api/v1/auth/logout`.
2. Backend reads refresh token from cookie.
3. Backend finds the refresh token family.
4. Backend revokes the whole token family.
5. Backend clears the refresh cookie.

## Frontend Session Handling

The frontend stores:

- `token` in `localStorage`
- `user` in `localStorage`

The `useLocalAuth()` hook:

1. Reads stored token and user.
2. Optimistically sets the user in React state.
3. Calls `GET /api/v1/auth/me`.
4. Updates stored user if the token is still valid.
5. Logs out if the token is invalid.

## Avatar Upload

Endpoint:

```text
PUT /api/v1/auth/updateavatar
```

Rules:

- Requires authentication.
- Expects multipart field `avatar`.
- Accepts image MIME types only.
- Maximum size is 5 MB.
- Stores images in `backend/uploads/avatars/`.
- Deletes the previous local avatar if it was also stored in `/uploads/avatars/`.

## Authorization Rules

| Middleware | Description |
| --- | --- |
| `protect` | Requires valid token and loads user. |
| `optionalAuth` | Allows public access but loads user if token is valid. |
| `authorize('admin')` | Allows only admins. |
| `requireApprovedFaculty` | Blocks unapproved faculty from protected contribution routes. |

## Security Notes

- Passwords are hashed with bcrypt and at least 12 rounds.
- Access and refresh tokens use separate secrets when configured.
- Refresh tokens are stored as hashes in the database.
- Refresh cookies are HTTP-only.
- Production cookies use `secure: true` and `sameSite: none`.
- Development cookies use `sameSite: lax`.
- Admin APIs require both authentication and role authorization.

## Current Practical Limitation

The frontend currently keeps the access token in `localStorage`. This is simple and works for the current app, but a more secure production approach would store access tokens in memory and rely on the refresh cookie to restore sessions.
