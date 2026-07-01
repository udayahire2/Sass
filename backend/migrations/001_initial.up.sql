CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    is_verified INTEGER NOT NULL DEFAULT 0,
    is_approved INTEGER NOT NULL DEFAULT 1,
    branch TEXT,
    academic_year TEXT,
    designation TEXT,
    department TEXT,
    college_name TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS faculty_subjects (
    id TEXT PRIMARY KEY,
    faculty_user_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (faculty_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    branch TEXT NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    UNIQUE (code, branch, semester)
);

CREATE TABLE IF NOT EXISTS syllabus (
    id TEXT PRIMARY KEY,
    subject_id TEXT,
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    branch TEXT NOT NULL,
    semester TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'markdown')),
    credits INTEGER NOT NULL,
    content_url TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    subject_id TEXT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    semester TEXT NOT NULL,
    branch TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'doc', 'markdown')),
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    pattern TEXT,
    unit TEXT,
    academic_year TEXT NOT NULL,
    author TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_by_user_id TEXT,
    approved_by_user_id TEXT,
    approved_at TEXT,
    rejection_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS study_materials (
    id TEXT PRIMARY KEY,
    subject_id TEXT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PDF', 'PPT', 'DOCX', 'Markdown', 'Video', 'Notes')),
    url TEXT,
    file_path TEXT,
    original_filename TEXT,
    mime_type TEXT,
    file_size INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    author TEXT NOT NULL,
    uploader_user_id TEXT,
    approved_by_user_id TEXT,
    approved_at TEXT,
    rejection_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (uploader_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    family_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address TEXT,
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    replaced_by_token_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (replaced_by_token_id) REFERENCES refresh_tokens(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS email_otps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    purpose TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    available_at TEXT NOT NULL,
    processed_at TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_role_deleted_at ON users(role, deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_email_deleted_at ON users(email, deleted_at);
CREATE INDEX IF NOT EXISTS idx_faculty_subjects_faculty ON faculty_subjects(faculty_user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_subjects_branch_semester ON subjects(branch, semester, deleted_at);
CREATE INDEX IF NOT EXISTS idx_syllabus_branch_semester ON syllabus(branch, semester, deleted_at);
CREATE INDEX IF NOT EXISTS idx_resources_filters ON resources(branch, semester, academic_year, deleted_at);
CREATE INDEX IF NOT EXISTS idx_resources_status_created_at ON resources(status, created_at, deleted_at);
CREATE INDEX IF NOT EXISTS idx_study_materials_status_created_at ON study_materials(status, created_at, deleted_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id ON refresh_tokens(family_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_email_otps_email_purpose ON email_otps(email, purpose, deleted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_status_available_at ON jobs(status, available_at, deleted_at);
