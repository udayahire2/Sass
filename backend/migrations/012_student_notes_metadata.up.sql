ALTER TABLE student_notes ADD COLUMN icon TEXT;
ALTER TABLE student_notes ADD COLUMN cover TEXT;
ALTER TABLE student_notes ADD COLUMN is_favorite INTEGER DEFAULT 0;
ALTER TABLE student_notes ADD COLUMN is_trash INTEGER DEFAULT 0;
ALTER TABLE student_notes ADD COLUMN font TEXT DEFAULT 'sans';
ALTER TABLE student_notes ADD COLUMN full_width INTEGER DEFAULT 0;
ALTER TABLE student_notes ADD COLUMN parent_id TEXT REFERENCES student_notes(id) ON DELETE SET NULL;
