-- Create branches table
CREATE TABLE branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'Available' CHECK(status IN ('Available', 'Coming Soon')),
    is_active INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
);

-- Add default branches based on existing data
INSERT INTO branches (id, name, status, created_at, updated_at) VALUES 
(lower(hex(randomblob(16))), 'Computer', 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(lower(hex(randomblob(16))), 'IT', 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(lower(hex(randomblob(16))), 'Mechanical', 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(lower(hex(randomblob(16))), 'Civil', 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(lower(hex(randomblob(16))), 'Electrical', 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Alter subjects table
ALTER TABLE subjects ADD COLUMN status TEXT DEFAULT 'Available' CHECK(status IN ('Available', 'Coming Soon'));
ALTER TABLE subjects ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE subjects ADD COLUMN order_index INTEGER DEFAULT 0;

-- Alter topics table
ALTER TABLE topics ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE topics ADD COLUMN content_json TEXT;
