CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    unit_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE (subject_id, unit_number)
);

CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL DEFAULT '',
    video_url TEXT,
    created_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_units_subject_order ON units(subject_id, deleted_at, unit_number);
CREATE INDEX IF NOT EXISTS idx_topics_unit_order ON topics(unit_id, deleted_at, title);
CREATE INDEX IF NOT EXISTS idx_topics_deleted_at ON topics(deleted_at);
