ALTER TABLE syllabi ADD COLUMN academic_year TEXT;

CREATE INDEX IF NOT EXISTS idx_syllabi_branch_year ON syllabi(branch, academic_year, deleted_at);
