-- Add file upload support columns to the resources table
ALTER TABLE resources ADD COLUMN file_path TEXT;
ALTER TABLE resources ADD COLUMN original_filename TEXT;
ALTER TABLE resources ADD COLUMN mime_type TEXT;
ALTER TABLE resources ADD COLUMN file_size INTEGER;
