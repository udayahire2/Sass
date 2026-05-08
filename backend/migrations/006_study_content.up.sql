CREATE TABLE IF NOT EXISTS study_content (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('study_stock', 'imp_questions', 'lecture_notes', 'practice_quizzes')),
    uploader_role TEXT NOT NULL CHECK (uploader_role IN ('student', 'faculty', 'admin')),
    uploader_user_id TEXT,
    uploader_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    resource_format TEXT,
    original_filename TEXT,
    mime_type TEXT,
    file_size INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (uploader_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_study_content_type_role_created_at
    ON study_content(type, uploader_role, created_at, deleted_at);

