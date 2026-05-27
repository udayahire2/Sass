const crypto = require('node:crypto');

const { getDatabase } = require('../config/database');
const { nowIso } = require('../utils/date');

function db() {
    return getDatabase();
}

function run(sql, params = []) {
    return db().prepare(sql).run(...params);
}

function get(sql, params = []) {
    return db().prepare(sql).get(...params);
}

function all(sql, params = []) {
    return db().prepare(sql).all(...params);
}

function transaction(fn) {
    const database = db();
    database.exec('BEGIN');
    try {
        const result = fn();
        database.exec('COMMIT');
        return result;
    } catch (error) {
        database.exec('ROLLBACK');
        throw error;
    }
}

function createTimestamps() {
    const timestamp = nowIso();
    return {
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

function splitName(name) {
    const parts = name.trim().split(/\s+/);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' '),
    };
}

function formatUser(row) {
    if (!row) {
        return null;
    }

    let preferences = {};
    if (row.preferences) {
        try {
            preferences = typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences;
        } catch (e) {
            // ignore
        }
    }

    return {
        _id: row.id,
        id: row.id,
        name: [row.first_name, row.last_name].filter(Boolean).join(' ').trim(),
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        avatar: row.avatar_url,
        avatarUrl: row.avatar_url,
        role: row.role,
        branch: row.branch,
        year: row.academic_year,
        designation: row.designation,
        department: row.department,
        collegeName: row.college_name,
        isVerified: Boolean(row.is_verified),
        isApproved: Boolean(row.is_approved),
        preferences,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function getFacultySubjects(userId) {
    return all(
        `SELECT subject_name
         FROM faculty_subjects
         WHERE faculty_user_id = ? AND deleted_at IS NULL
         ORDER BY subject_name ASC`,
        [userId]
    ).map((row) => row.subject_name);
}

function formatUserWithRelations(row) {
    const user = formatUser(row);
    if (!user) {
        return null;
    }

    if (user.role === 'faculty') {
        user.subjects = getFacultySubjects(row.id);
    }

    return user;
}

function formatStudyMaterial(row) {
    if (!row) {
        return null;
    }

    return {
        _id: row.id,
        id: row.id,
        title: row.title,
        subject: row.subject,
        type: row.type,
        url: row.url,
        filePath: row.file_path,
        originalFilename: row.original_filename,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        status: row.status,
        author: row.author,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function formatContent(row) {
    if (!row) {
        return null;
    }

    const uploaderName = row.uploader_name || [row.first_name, row.last_name].filter(Boolean).join(' ').trim();

    return {
        _id: row.id,
        id: row.id,
        title: row.title,
        type: row.type,
        uploaderRole: row.uploader_role,
        uploader_role: row.uploader_role,
        uploaderName,
        uploader_name: uploaderName,
        uploaderAvatar: row.avatar_url || null,
        uploader_avatar: row.avatar_url || null,
        uploaderUserId: row.uploader_user_id,
        uploader_user_id: row.uploader_user_id,
        fileUrl: row.file_url,
        file_url: row.file_url,
        description: row.description,
        resourceFormat: row.resource_format,
        resource_format: row.resource_format,
        originalFilename: row.original_filename,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function formatResource(row) {
    if (!row) {
        return null;
    }

    return {
        _id: row.id,
        id: row.id,
        title: row.title,
        subject: row.subject,
        semester: row.semester,
        branch: row.branch,
        type: row.type,
        description: row.description,
        category: row.category,
        pattern: row.pattern,
        unit: row.unit,
        year: row.academic_year,
        author: row.author,
        url: row.url,
        filePath: row.file_path,
        originalFilename: row.original_filename,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function formatSyllabus(row) {
    if (!row) {
        return null;
    }

    return {
        _id: row.id,
        id: row.id,
        title: row.title,
        code: row.code,
        branch: row.branch,
        semester: row.semester,
        year: row.academic_year,
        type: row.type,
        credits: row.credits,
        contentUrl: row.content_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function ensureSubject({ title, code, branch, semester, credits = 0, description = null }) {
    if (!code || !branch || !semester) {
        return null;
    }

    const existing = get(
        `SELECT *
         FROM subjects
         WHERE code = ? AND branch = ? AND semester = ? AND deleted_at IS NULL`,
        [code, branch, Number(semester)]
    );

    if (existing) {
        return existing.id;
    }

    const timestamps = createTimestamps();
    const subjectId = crypto.randomUUID();
    run(
        `INSERT INTO subjects (
            id, code, title, branch, semester, credits, description, created_at, updated_at, deleted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        [
            subjectId,
            code,
            title,
            branch,
            Number(semester),
            credits,
            description,
            timestamps.createdAt,
            timestamps.updatedAt,
        ]
    );

    return subjectId;
}

module.exports = {
    all,
    createTimestamps,
    db,
    ensureSubject,
    formatContent,
    formatResource,
    formatStudyMaterial,
    formatSyllabus,
    formatUser,
    formatUserWithRelations,
    get,
    getFacultySubjects,
    run,
    splitName,
    transaction,
};
