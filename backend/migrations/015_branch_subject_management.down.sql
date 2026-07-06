ALTER TABLE topics DROP COLUMN content_json;
ALTER TABLE topics DROP COLUMN is_active;
ALTER TABLE subjects DROP COLUMN order_index;
ALTER TABLE subjects DROP COLUMN is_active;
ALTER TABLE subjects DROP COLUMN status;
DROP TABLE IF EXISTS branches;
