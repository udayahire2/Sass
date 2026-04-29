const crypto = require('node:crypto');

const { cache } = require('../config/cache');
const { all, createTimestamps, formatResource, get, run } = require('../services/dbService');
const { AppError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');

function isAdminRequest(req) {
    return req.user?.role === 'admin';
}

function buildResourceFilters(req) {
    const filters = ['deleted_at IS NULL'];
    const params = [];

    if (!isAdminRequest(req)) {
        filters.push(`status = 'approved'`);
    } else if (req.query.status) {
        filters.push('status = ?');
        params.push(req.query.status);
    }

    if (req.query.branch) {
        filters.push('branch = ?');
        params.push(req.query.branch);
    }

    if (req.query.semester) {
        filters.push('semester = ?');
        params.push(req.query.semester);
    }

    if (req.query.search) {
        const search = `%${String(req.query.search).toLowerCase()}%`;
        filters.push('(LOWER(title) LIKE ? OR LOWER(subject) LIKE ? OR LOWER(author) LIKE ?)');
        params.push(search, search, search);
    }

    return {
        params,
        where: filters.join(' AND '),
    };
}

function getResourceRow(resourceId) {
    return get(
        `SELECT *
         FROM resources
         WHERE id = ? AND deleted_at IS NULL`,
        [resourceId]
    );
}

async function invalidateAdminStats() {
    await cache.del('admin:stats');
}

exports.getResources = async (req, res, next) => {
    try {
        const { params, where } = buildResourceFilters(req);
        const resources = all(
            `SELECT *
             FROM resources
             WHERE ${where}
             ORDER BY created_at DESC`,
            params
        ).map((row) => formatResource(row));

        return sendSuccess(res, {
            message: 'Resources fetched successfully',
            data: resources,
            legacy: {
                count: resources.length,
                resources,
            },
        });
    } catch (error) {
        return next(error);
    }
};

exports.getResource = async (req, res, next) => {
    try {
        const row = getResourceRow(req.params.id);

        if (!row || (!isAdminRequest(req) && row.status !== 'approved')) {
            return next(new AppError('Resource not found', 404));
        }

        const resource = formatResource(row);
        return sendSuccess(res, {
            message: 'Resource fetched successfully',
            data: resource,
        });
    } catch (error) {
        return next(error);
    }
};

exports.createResource = async (req, res, next) => {
    try {
        const timestamps = createTimestamps();
        const resourceId = crypto.randomUUID();

        run(
            `INSERT INTO resources (
                id, subject_id, title, subject, semester, branch, type, description, category, pattern, unit,
                academic_year, author, url, status, created_by_user_id, approved_by_user_id, approved_at,
                created_at, updated_at, deleted_at
            ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, ?, ?, NULL)`,
            [
                resourceId,
                req.body.title,
                req.body.subject,
                req.body.semester,
                req.body.branch,
                req.body.type,
                req.body.description,
                req.body.category,
                req.body.pattern || '',
                req.body.unit || '',
                req.body.year,
                req.body.author,
                req.body.url,
                req.user.id,
                req.user.id,
                timestamps.createdAt,
                timestamps.createdAt,
                timestamps.updatedAt,
            ]
        );

        await invalidateAdminStats();

        const resource = formatResource(getResourceRow(resourceId));
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Resource created successfully',
            data: resource,
        });
    } catch (error) {
        return next(error);
    }
};

exports.updateResource = async (req, res, next) => {
    try {
        const existing = getResourceRow(req.params.id);
        if (!existing) {
            return next(new AppError('Resource not found', 404));
        }

        const fieldMap = {
            author: 'author',
            branch: 'branch',
            category: 'category',
            description: 'description',
            pattern: 'pattern',
            semester: 'semester',
            status: 'status',
            subject: 'subject',
            title: 'title',
            type: 'type',
            unit: 'unit',
            url: 'url',
            year: 'academic_year',
        };

        const updates = [];
        const values = [];

        for (const [key, column] of Object.entries(fieldMap)) {
            if (req.body[key] !== undefined) {
                updates.push(`${column} = ?`);
                values.push(req.body[key]);
            }
        }

        if (!updates.length) {
            return next(new AppError('No valid resource fields were provided', 400));
        }

        const timestamps = createTimestamps();
        updates.push('updated_at = ?');
        values.push(timestamps.updatedAt, existing.id);

        run(
            `UPDATE resources
             SET ${updates.join(', ')}
             WHERE id = ? AND deleted_at IS NULL`,
            values
        );

        await invalidateAdminStats();

        const resource = formatResource(getResourceRow(existing.id));
        return sendSuccess(res, {
            message: 'Resource updated successfully',
            data: resource,
        });
    } catch (error) {
        return next(error);
    }
};

exports.deleteResource = async (req, res, next) => {
    try {
        const existing = getResourceRow(req.params.id);
        if (!existing) {
            return next(new AppError('Resource not found', 404));
        }

        const timestamps = createTimestamps();
        run(
            `UPDATE resources
             SET deleted_at = ?, updated_at = ?
             WHERE id = ?`,
            [timestamps.updatedAt, timestamps.updatedAt, existing.id]
        );

        await invalidateAdminStats();

        return sendSuccess(res, {
            message: 'Resource deleted successfully',
            data: {},
        });
    } catch (error) {
        return next(error);
    }
};
