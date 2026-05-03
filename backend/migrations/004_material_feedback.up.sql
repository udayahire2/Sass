-- Migration: Add material_feedback table for faculty review system

CREATE TABLE IF NOT EXISTS material_feedback (
    id TEXT PRIMARY KEY,
    study_material_id TEXT NOT NULL,
    reviewer_user_id TEXT NOT NULL,
    feedback_text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (study_material_id) REFERENCES study_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (study_material_id, reviewer_user_id)
);

CREATE INDEX IF NOT EXISTS idx_material_feedback_material_id ON material_feedback(study_material_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_material_feedback_reviewer_id ON material_feedback(reviewer_user_id, deleted_at);
