ALTER TABLE syllabus ADD COLUMN academic_year TEXT;

CREATE INDEX IF NOT EXISTS idx_syllabus_branch_year ON syllabus(branch, academic_year, deleted_at);
