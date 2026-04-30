const { all, get } = require('./dbService');

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

    return {
        _id: row.id,
        id: row.id,
        title: row.title,
        description: `Comprehensive detailed study note for ${row.title}. Focuses on core concepts required for NMU exams.`,
        contentMarkdown: row.content_markdown,
        markdownContent: row.content_markdown,
        videoUrl: row.video_url,
        youtubeVideoId,
        estimatedTime: '15 mins',
        summaryPoints: [
            'Key concept definition and importance.',
            'Standard algorithm steps or formula.',
            'Common exam question patterns.',
            'Advantages and limitations.',
        ],
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
         HAVING COUNT(DISTINCT u.id) > 0
         ORDER BY s.code ASC, s.title ASC`,
        [branch, Number(semester)]
    );

    return rows.map(formatSubject);
}

function getUnitsBySubject(subjectId) {
    const unitRows = all(
        `SELECT *
         FROM units
         WHERE subject_id = ? AND deleted_at IS NULL
         ORDER BY unit_number ASC, title ASC`,
        [subjectId]
    );

    return unitRows.map((unit) => {
        const topicRows = all(
            `SELECT *
             FROM topics
             WHERE unit_id = ? AND deleted_at IS NULL
             ORDER BY title ASC`,
            [unit.id]
        );

        return formatUnit(unit, topicRows.map(formatTopic));
    });
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

module.exports = {
    getSubjectsByBranchSemester,
    getTopicById,
    getUnitsBySubject,
};
