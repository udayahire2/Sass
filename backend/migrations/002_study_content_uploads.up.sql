PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS study_materials_new (
    id TEXT PRIMARY KEY,
    subject_id TEXT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PDF', 'PPT', 'DOCX', 'Markdown', 'Video', 'Notes')),
    url TEXT,
    file_path TEXT,
    original_filename TEXT,
    mime_type TEXT,
    file_size INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    author TEXT NOT NULL,
    uploader_user_id TEXT,
    approved_by_user_id TEXT,
    approved_at TEXT,
    rejection_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (uploader_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO study_materials_new (
    id, subject_id, title, subject, type, url, file_path, original_filename, mime_type, file_size,
    status, author, uploader_user_id, approved_by_user_id, approved_at, rejection_reason,
    created_at, updated_at, deleted_at
)
SELECT
    id, subject_id, title, subject, type, url, file_path, NULL, NULL, NULL,
    status, author, uploader_user_id, approved_by_user_id, approved_at, rejection_reason,
    created_at, updated_at, deleted_at
FROM study_materials;

DROP TABLE study_materials;
ALTER TABLE study_materials_new RENAME TO study_materials;

CREATE INDEX IF NOT EXISTS idx_study_materials_status_created_at ON study_materials(status, created_at, deleted_at);

PRAGMA foreign_keys = ON;
