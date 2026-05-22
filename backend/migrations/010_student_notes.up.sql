CREATE TABLE IF NOT EXISTS student_notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic_id TEXT,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_student_notes_user ON student_notes(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_student_notes_topic ON student_notes(topic_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_student_notes_deleted ON student_notes(deleted_at);
