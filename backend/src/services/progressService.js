const crypto = require('node:crypto');
const { all, get, run, createTimestamps } = require('./dbService');

function formatProgress(row) {
    if (!row) return null;
    return {
        id: row.id,
        userId: row.user_id,
        topicId: row.topic_id,
        status: row.status,
        timeSpentSeconds: row.time_spent_seconds,
        lastAccessedAt: row.last_accessed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function getUserProgress(userId) {
    const rows = all(
        `SELECT * FROM user_topic_progress WHERE user_id = ?`,
        [userId]
    );
    return rows.map(formatProgress);
}

function getTopicProgress(userId, topicId) {
    const row = get(
        `SELECT * FROM user_topic_progress WHERE user_id = ? AND topic_id = ?`,
        [userId, topicId]
    );
    return formatProgress(row);
}

function updateUserProgress(userId, topicId, data) {
    const { status, time_spent_seconds, last_accessed_at } = data;
    const existing = getTopicProgress(userId, topicId);
    const timestamps = createTimestamps();

    if (!existing) {
        const id = crypto.randomUUID();
        run(
            `INSERT INTO user_topic_progress (id, user_id, topic_id, status, time_spent_seconds, last_accessed_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, 
                userId, 
                topicId, 
                status || 'Not_Started', 
                time_spent_seconds || 0, 
                last_accessed_at || timestamps.createdAt, 
                timestamps.createdAt, 
                timestamps.updatedAt
            ]
        );
    } else {
        const updates = [];
        const params = [];

        if (status !== undefined) { updates.push('status = ?'); params.push(status); }
        if (time_spent_seconds !== undefined) { updates.push('time_spent_seconds = ?'); params.push(time_spent_seconds); }
        if (last_accessed_at !== undefined) { updates.push('last_accessed_at = ?'); params.push(last_accessed_at); }

        updates.push('updated_at = ?');
        params.push(timestamps.updatedAt);
        params.push(userId, topicId);

        run(
            `UPDATE user_topic_progress SET ${updates.join(', ')} WHERE user_id = ? AND topic_id = ?`,
            params
        );
    }

    return getTopicProgress(userId, topicId);
}

module.exports = {
    getUserProgress,
    getTopicProgress,
    updateUserProgress
};
