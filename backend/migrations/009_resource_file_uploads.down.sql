-- SQLite doesn't support DROP COLUMN directly in older versions.
-- This is a placeholder. To rollback, recreate the table without these columns.
-- For modern SQLite (3.35.0+), the following works:
ALTER TABLE resources DROP COLUMN file_path;
ALTER TABLE resources DROP COLUMN original_filename;
ALTER TABLE resources DROP COLUMN mime_type;
ALTER TABLE resources DROP COLUMN file_size;
