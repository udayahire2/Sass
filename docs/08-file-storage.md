# File Storage

The current implementation uses local filesystem storage for uploaded files.

## Upload Categories

| Category | Endpoint | Storage folder | Max size | Access pattern |
| --- | --- | --- | --- | --- |
| Study material files | `POST /api/v1/study-materials` | `backend/uploads/` | 50 MB | Streamed through `/api/v1/files/:studyMaterialId`. |
| Syllabus PDF files | `POST /api/v1/syllabus` | `backend/uploads/syllabus/` | 20 MB | Streamed through `/api/v1/syllabus/:id/file`. |
| Avatar images | `PUT /api/v1/auth/updateavatar` | `backend/uploads/avatars/` | 5 MB | Served statically from `/uploads/avatars/...`. |

## Static Serving vs File Proxy

The Express app currently serves only avatar files statically:

```text
/uploads/avatars -> backend/uploads/avatars
```

Study-material files and syllabus files are not broadly exposed by `express.static` in the active backend. The frontend opens them through backend proxy routes:

```text
GET /api/v1/files/:studyMaterialId
GET /api/v1/syllabus/:id/file
```

This matters because the file proxy can inspect database records before streaming a local file.

## Study Material Uploads

Handled in:

```text
backend/src/routes/studyMaterialRoutes.js
```

Allowed file extensions:

| Extension | Stored type |
| --- | --- |
| `.pdf` | `PDF` |
| `.ppt` | `PPT` |
| `.pptx` | `PPT` |
| `.docx` | `DOCX` |
| `.md` | `Markdown` |

Process:

1. User selects a supported file on `/add-study-content` or `/profile`.
2. Frontend sends `multipart/form-data`.
3. Backend authenticates the user.
4. Backend blocks unapproved faculty.
5. Multer validates extension and file size.
6. Multer creates a unique filename using timestamp plus random number.
7. File is saved under `backend/uploads/`.
8. Backend stores metadata in `study_materials`:
   - `file_path`
   - `original_filename`
   - `mime_type`
   - `file_size`
9. Material status starts as `pending`.
10. Admin approves or rejects it.
11. Approved material becomes discoverable publicly.

Example stored path:

```text
/uploads/1776677223797-946434751.pdf
```

## Study Material File Proxy

Endpoint:

```text
GET /api/v1/files/:studyMaterialId
```

Behavior:

- Looks up the `study_materials` row.
- Requires a stored `file_path`.
- Allows public access only when material status is `approved`.
- Allows admins to access non-approved files for moderation.
- Resolves the path through `backend/src/utils/fileProxy.js`.
- Streams the file with stored MIME type and original filename.

Frontend usage:

- `buildAssetUrl(path, { studyMaterialId })` converts stored upload paths into `/api/v1/files/:studyMaterialId`.
- Admin previews call `fetchAssetBlobUrl()` and render a blob URL in an iframe.

## Syllabus Uploads

Handled in:

```text
backend/src/routes/syllabusRoutes.js
```

Allowed file extensions:

- `.pdf`
- `.md`
- `.markdown`
- `.txt`

Behavior:

- PDF files are saved to `backend/uploads/syllabus/`.
- PDF paths are stored in `syllabi.content_url`.
- Markdown/text uploads are read into memory and stored directly in `syllabi.content_url`.
- The API sets `req.body.type` from the uploaded file extension.

Example PDF path:

```text
/uploads/syllabus/1777458074216-238900937.pdf
```

Syllabus file endpoint:

```text
GET /api/v1/syllabus/:id/file
```

This endpoint streams local PDF files for syllabus records.

## Avatar Uploads

Handled in:

```text
backend/src/controllers/authController.js
```

Rules:

- User must be authenticated.
- Form field name must be `avatar`.
- Allowed MIME types are JPEG, PNG, WEBP, and GIF.
- Maximum file size is 5 MB.
- File is saved to `backend/uploads/avatars/`.
- If the previous avatar was a local avatar, the backend deletes the old file.

Example avatar path:

```text
/uploads/avatars/avatar-1777202860253-477675532.jpg
```

The profile page also crops the selected avatar client-side before upload.

## Frontend Asset URL Handling

`app/src/services/api.ts` contains `buildAssetUrl()`.

Behavior:

- External `http` and `https` URLs are returned unchanged.
- Study-material uploads with an ID are converted to `/api/v1/files/:studyMaterialId`.
- Syllabus PDFs with an ID are converted to `/api/v1/syllabus/:id/file`.
- Other relative paths are resolved against the API origin.

## Access Control

Access is mixed by file category:

- Avatar files are public static assets.
- Syllabus PDF files are public through the syllabus file endpoint.
- Approved study-material files are public through the file proxy.
- Pending/rejected study-material files are restricted to admins through the file proxy.

The system controls both discovery and proxy access for study-material files. For stricter production security, use private object storage and signed URLs.

## Production Considerations

Local filesystem storage works for local development and simple long-lived servers. It is not suitable for many serverless deployments because local files may disappear between deployments or function instances.

Recommended production upgrades:

- Store uploads in S3, Cloudinary, Supabase Storage, or another object store.
- Store object keys/URLs in SQLite instead of local paths.
- Use signed URLs for private files.
- Keep local storage only for development.
