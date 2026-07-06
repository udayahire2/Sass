const crypto = require('node:crypto');
const { all, get, run, createTimestamps } = require('./dbService');

function extractYoutubeVideoId(videoUrl) {
    if (!videoUrl) {
        return null;
    }

    if (!videoUrl.includes('/') && !videoUrl.includes('?')) {
        return videoUrl;
    }

    try {
        const url = new URL(videoUrl);
        if (url.hostname.includes('youtu.be')) {
            return url.pathname.replace('/', '') || null;
        }

        if (url.searchParams.get('v')) {
            return url.searchParams.get('v');
        }

        const embedMatch = url.pathname.match(/\/embed\/([^/?]+)/);
        return embedMatch?.[1] || null;
    } catch {
        return null;
    }
}

function formatTopic(row) {
    if (!row) {
        return null;
    }

    const youtubeVideoId = extractYoutubeVideoId(row.video_url);
    
    let parsedSummaryPoints = [];
    if (row.summary_points) {
        try {
            parsedSummaryPoints = JSON.parse(row.summary_points);
        } catch (e) {
            console.error("Failed to parse summary_points", e);
        }
    }

    return {
        _id: row.id,
        id: row.id,
        title: row.title,
        description: row.description || `Comprehensive detailed study note for ${row.title}. Focuses on core concepts required for NMU exams.`,
        contentMarkdown: row.content_markdown,
        markdownContent: row.content_markdown,
        videoUrl: row.video_url,
        youtubeVideoId,
        estimatedTime: row.estimated_time || '15 mins',
        orderIndex: Number(row.order_index || 0),
        summaryPoints: parsedSummaryPoints.length > 0 ? parsedSummaryPoints : [
            'Key concept definition and importance.',
            'Standard algorithm steps or formula.',
            'Common exam question patterns.',
            'Advantages and limitations.',
        ],
        isActive: Boolean(row.is_active !== undefined ? row.is_active : 1),
        contentJson: row.content_json,
        createdAt: row.created_at,
    };
}

function formatSubject(row) {
    if (!row) {
        return null;
    }

    return {
        _id: row.id,
        id: row.id,
        name: row.title,
        title: row.title,
        code: row.code,
        branch: row.branch,
        semester: Number(row.semester),
        credits: Number(row.credits || 0),
        description: row.description,
        unitCount: Number(row.unit_count || 0),
        topicCount: Number(row.topic_count || 0),
        status: row.status || 'Available',
        isActive: Boolean(row.is_active !== undefined ? row.is_active : 1),
        orderIndex: Number(row.order_index || 0),
        units: [],
        papers: [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function formatUnit(row, topics = []) {
    return {
        _id: row.id,
        id: row.id,
        number: Number(row.unit_number),
        unitNumber: Number(row.unit_number),
        title: row.title,
        description: row.description,
        orderIndex: Number(row.order_index || 0),
        topics,
        createdAt: row.created_at,
    };
}

function getSubjectsByBranchSemester(branch, semester) {
    const rows = all(
        `SELECT
            s.*,
            COUNT(DISTINCT u.id) AS unit_count,
            COUNT(DISTINCT t.id) AS topic_count
         FROM subjects s
         LEFT JOIN units u
            ON u.subject_id = s.id
           AND u.deleted_at IS NULL
         LEFT JOIN topics t
            ON t.unit_id = u.id
           AND t.deleted_at IS NULL
         WHERE s.branch = ?
           AND s.semester = ?
           AND s.deleted_at IS NULL
         GROUP BY s.id
         ORDER BY s.order_index ASC, s.code ASC, s.title ASC`,
        [branch, Number(semester)]
    );

    return rows.map(formatSubject);
}

function getSubjectById(subjectId) {
    const row = get(
        `SELECT
            s.*,
            COUNT(DISTINCT u.id) AS unit_count,
            COUNT(DISTINCT t.id) AS topic_count
         FROM subjects s
         LEFT JOIN units u
            ON u.subject_id = s.id
           AND u.deleted_at IS NULL
         LEFT JOIN topics t
            ON t.unit_id = u.id
           AND t.deleted_at IS NULL
         WHERE s.id = ?
           AND s.deleted_at IS NULL
         GROUP BY s.id`,
        [subjectId]
    );

    return row ? formatSubject(row) : null;
}

function createSubject(data) {
    const { title, code, branch, semester, credits, description, status, is_active, order_index } = data;
    const timestamps = createTimestamps();
    const id = crypto.randomUUID();

    run(
        `INSERT INTO subjects (id, code, title, branch, semester, credits, description, status, is_active, order_index, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, code, title, branch, Number(semester), Number(credits) || 0, description || null, status || 'Available', is_active !== undefined ? (is_active ? 1 : 0) : 1, Number(order_index || 0), timestamps.createdAt, timestamps.updatedAt]
    );

    return getSubjectById(id);
}

function updateSubject(subjectId, data) {
    const { title, code, branch, semester, credits, description, status, is_active, order_index } = data;
    const timestamps = createTimestamps();
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (code !== undefined) { updates.push('code = ?'); params.push(code); }
    if (branch !== undefined) { updates.push('branch = ?'); params.push(branch); }
    if (semester !== undefined) { updates.push('semester = ?'); params.push(Number(semester)); }
    if (credits !== undefined) { updates.push('credits = ?'); params.push(Number(credits)); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    if (order_index !== undefined) { updates.push('order_index = ?'); params.push(Number(order_index)); }

    if (updates.length > 0) {
        updates.push('updated_at = ?');
        params.push(timestamps.updatedAt);
        params.push(subjectId);
        
        run(`UPDATE subjects SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`, params);
    }

    return getSubjectById(subjectId);
}

function deleteSubject(subjectId) {
    const timestamps = createTimestamps();
    run(`UPDATE subjects SET deleted_at = ? WHERE id = ?`, [timestamps.updatedAt, subjectId]);
    return true;
}

function getUnitsBySubject(subjectId) {
    const unitRows = all(
        `SELECT *
         FROM units
         WHERE subject_id = ? AND deleted_at IS NULL
         ORDER BY order_index ASC, unit_number ASC, title ASC`,
        [subjectId]
    );

    return unitRows.map((unit) => {
        const topicRows = all(
            `SELECT *
             FROM topics
             WHERE unit_id = ? AND deleted_at IS NULL
             ORDER BY order_index ASC, title ASC`,
            [unit.id]
        );

        return formatUnit(unit, topicRows.map(formatTopic));
    });
}

function getUnitById(unitId) {
    const unit = get(
        `SELECT * FROM units WHERE id = ? AND deleted_at IS NULL`,
        [unitId]
    );
    if (!unit) return null;

    const topicRows = all(
        `SELECT * FROM topics WHERE unit_id = ? AND deleted_at IS NULL ORDER BY order_index ASC, title ASC`,
        [unit.id]
    );

    return formatUnit(unit, topicRows.map(formatTopic));
}

function createUnit(subjectId, data) {
    const { title, description, unit_number, order_index } = data;
    const timestamps = createTimestamps();
    const id = crypto.randomUUID();

    run(
        `INSERT INTO units (id, subject_id, unit_number, title, description, order_index, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, subjectId, Number(unit_number), title, description || null, Number(order_index || 0), timestamps.createdAt]
    );

    return getUnitById(id);
}

function updateUnit(unitId, data) {
    const { title, description, unit_number, order_index } = data;
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (unit_number !== undefined) { updates.push('unit_number = ?'); params.push(Number(unit_number)); }
    if (order_index !== undefined) { updates.push('order_index = ?'); params.push(Number(order_index)); }

    if (updates.length > 0) {
        params.push(unitId);
        run(`UPDATE units SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`, params);
    }

    return getUnitById(unitId);
}

function deleteUnit(unitId) {
    const timestamps = createTimestamps();
    run(`UPDATE units SET deleted_at = ? WHERE id = ?`, [timestamps.updatedAt, unitId]);
    return true;
}

function getTopicById(topicId) {
    const row = get(
        `SELECT
            t.*,
            u.id AS unit_id,
            u.unit_number,
            u.title AS unit_title,
            s.id AS subject_id,
            s.title AS subject_title,
            s.code AS subject_code,
            s.branch,
            s.semester
         FROM topics t
         INNER JOIN units u ON u.id = t.unit_id AND u.deleted_at IS NULL
         INNER JOIN subjects s ON s.id = u.subject_id AND s.deleted_at IS NULL
         WHERE t.id = ? AND t.deleted_at IS NULL`,
        [topicId]
    );

    if (!row) {
        return null;
    }

    return {
        ...formatTopic(row),
        unit: {
            id: row.unit_id,
            number: Number(row.unit_number),
            title: row.unit_title,
        },
        subject: {
            id: row.subject_id,
            name: row.subject_title,
            title: row.subject_title,
            code: row.subject_code,
            branch: row.branch,
            semester: Number(row.semester),
        },
    };
}

function updateTopic(topicId, data) {
    const { title, content_markdown, description, estimated_time, summary_points, video_url } = data;
    const updates = [];
    const params = [];

    if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
    }
    if (content_markdown !== undefined) {
        updates.push('content_markdown = ?');
        params.push(content_markdown);
    }
    if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
    }
    if (estimated_time !== undefined) {
        updates.push('estimated_time = ?');
        params.push(estimated_time);
    }
    if (summary_points !== undefined) {
        updates.push('summary_points = ?');
        params.push(typeof summary_points === 'string' ? summary_points : JSON.stringify(summary_points));
    }
    if (video_url !== undefined) {
        updates.push('video_url = ?');
        params.push(video_url);
    }
    if (data.order_index !== undefined) {
        updates.push('order_index = ?');
        params.push(Number(data.order_index));
    }
    if (data.is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(data.is_active ? 1 : 0);
    }
    if (data.content_json !== undefined) {
        updates.push('content_json = ?');
        params.push(data.content_json);
    }

    if (updates.length === 0) {
        return getTopicById(topicId);
    }

    const { run } = require('./dbService');
    const sql = `UPDATE topics SET ${updates.join(', ')} WHERE id = ?`;
    params.push(topicId);

    run(sql, params);
    
    return getTopicById(topicId);
}

function createTopic(unitId, data) {
    const { title, content_markdown, video_url, description, estimated_time, summary_points, order_index, is_active, content_json } = data;
    const timestamps = createTimestamps();
    const id = crypto.randomUUID();
    
    const summaryPointsStr = typeof summary_points === 'string' ? summary_points : (summary_points ? JSON.stringify(summary_points) : null);

    run(
        `INSERT INTO topics (id, unit_id, title, content_markdown, video_url, description, estimated_time, summary_points, order_index, is_active, content_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, unitId, title, content_markdown || '', video_url || null, description || null, estimated_time || null, summaryPointsStr, Number(order_index || 0), is_active !== undefined ? (is_active ? 1 : 0) : 1, content_json || null, timestamps.createdAt]
    );

    return getTopicById(id);
}

function deleteTopic(topicId) {
    const timestamps = createTimestamps();
    run(`UPDATE topics SET deleted_at = ? WHERE id = ?`, [timestamps.updatedAt, topicId]);
    return true;
}

module.exports = {
    getSubjectsByBranchSemester,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
    getTopicById,
    getUnitsBySubject,
    getUnitById,
    createUnit,
    updateUnit,
    deleteUnit,
    updateTopic,
    createTopic,
    deleteTopic,
};
