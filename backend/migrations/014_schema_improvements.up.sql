-- Add order_index to units
ALTER TABLE units ADD COLUMN order_index INTEGER DEFAULT 0;

-- Add order_index to topics
ALTER TABLE topics ADD COLUMN order_index INTEGER DEFAULT 0;

-- Add subject_id to student_notes
ALTER TABLE student_notes ADD COLUMN subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL;

-- Create user_topic_progress table
CREATE TABLE IF NOT EXISTS user_topic_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Not_Started', 'In_Progress', 'Completed')) DEFAULT 'Not_Started',
    time_spent_seconds INTEGER DEFAULT 0,
    last_accessed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user ON user_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_topic ON user_topic_progress(topic_id);
