# File Storage

The application currently uses local filesystem storage for uploaded files.

## Static File Serving

The backend serves uploaded files through:

```text
/uploads
```

Implementation:

```text
backend/src/app.js
```

The Express app maps `/uploads` to:

```text
backend/uploads/
```

## Upload Categories

| Category | Endpoint | Storage Folder | Max Size |
| --- | --- | --- | --- |
| Study material files | `POST /api/v1/study-materials` | `backend/uploads/` | 50 MB |
| Syllabus files | `POST /api/v1/syllabus` | `backend/uploads/syllabus/` | 20 MB |
| Avatar images | `PUT /api/v1/auth/updateavatar` | `backend/uploads/avatars/` | 5 MB |

## Study Material Uploads

Study material uploads are handled in:

```text
backend/src/routes/studyMaterialRoutes.js
```

Allowed file extensions:

| Extension | Stored Type |
| --- | --- |
| `.pdf` | `PDF` |
| `.ppt` | `PPT` |
| `.pptx` | `PPT` |
| `.docx` | `DOCX` |
| `.md` | `Markdown` |

Process:

1. User selects a supported file on `/add-study-content`.
2. Frontend sends `multipart/form-data`.
3. Multer validates file extension.
4. Multer creates a unique filename using timestamp plus random number.
5. File is saved in `backend/uploads/`.
6. Backend stores metadata in `study_materials`, including:
   - `file_path`
   - `original_filename`
   - `mime_type`
   - `file_size`
7. Material status is set to `pending`.
8. Admin approves or rejects it.
9. Approved material becomes visible publicly.

Example stored file path:

```text
/uploads/1776677223797-946434751.pdf
```

## Syllabus Uploads

Syllabus uploads are handled in:

```text
backend/src/routes/syllabusRoutes.js
```

Allowed file extensions:

- `.pdf`
- `.md`
- `.markdown`
- `.txt`

Behavior:

- PDF files are saved to `backend/uploads/syllabus/` and the public path is stored in `syllabi.content_url`.
- Markdown and text files are read into memory and their text content is stored directly in `syllabi.content_url`.

Example PDF path:

```text
/uploads/syllabus/1777458074216-238900937.pdf
```

## Avatar Uploads

Avatar uploads are handled in:

```text
backend/src/controllers/authController.js
```

Rules:

- User must be authenticated.
- Form field name must be `avatar`.
- File MIME type must start with `image/`.
- Maximum file size is 5 MB.
- File is saved to `backend/uploads/avatars/`.
- If the previous avatar was a local avatar, the backend deletes the old file.

Example avatar path:

```text
/uploads/avatars/avatar-1777202860253-477675532.jpg
```

## Frontend Asset URL Handling

The frontend uses `buildAssetUrl()` in:

```text
app/src/services/api.ts
```

This helper:

- Returns full external URLs unchanged.
- Converts relative paths such as `/uploads/file.pdf` into a full URL using the API origin.

This allows the frontend to open uploaded files even when the API is hosted on a different origin than the frontend.

## Access Control

Uploaded files under `/uploads` are publicly served if someone has the direct URL.

The application controls discovery of files, not file access itself:

- Pending uploads are only listed to admins.
- Approved uploads are listed publicly.
- The file URL itself is static and not token-protected.

For stricter production security, file serving should use signed URLs or an authenticated file proxy.

## Production Considerations

Local filesystem storage is fine for local development and simple deployments. It is not ideal for production serverless hosting because files may not persist across deployments or function instances.

Recommended production upgrade:

- Store uploads in S3, Cloudinary, Supabase Storage, or another object storage provider.
- Store only the object URL/key in SQLite.
- Use signed URLs for private or pending content.
- Keep local storage only for development.
