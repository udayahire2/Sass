-- Ensure syllabus table exists first
CREATE TABLE IF NOT EXISTS syllabus (
    id TEXT PRIMARY KEY,
    subject_id TEXT,
    title TEXT NOT NULL,
    code TEXT NOT NULL DEFAULT '',
    branch TEXT NOT NULL,
    semester TEXT NOT NULL DEFAULT '',
    academic_year TEXT,
    type TEXT NOT NULL DEFAULT 'pdf',
    credits INTEGER NOT NULL DEFAULT 0,
    content_url TEXT NOT NULL DEFAULT '',
    syllabus_type TEXT DEFAULT 'subject',
    program TEXT,
    subject_name TEXT,
    subject_code TEXT,
    semesters TEXT,
    description TEXT,
    topics TEXT,
    learning_outcomes TEXT,
    textbooks TEXT,
    assessment_scheme TEXT,
    references_list TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_syllabus_type ON syllabus(syllabus_type, deleted_at);
CREATE INDEX IF NOT EXISTS idx_syllabus_program ON syllabus(program, deleted_at);
