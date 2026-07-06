const crypto = require('node:crypto');
const { all, get, run, createTimestamps } = require('./dbService');

function formatBranch(row) {
    if (!row) return null;
    return {
        _id: row.id,
        id: row.id,
        name: row.name,
        status: row.status,
        isActive: Boolean(row.is_active),
        is_active: Boolean(row.is_active),
        orderIndex: Number(row.order_index),
        order_index: Number(row.order_index),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function getAllBranches() {
    const rows = all(`SELECT * FROM branches WHERE deleted_at IS NULL ORDER BY order_index ASC, name ASC`);
    return rows.map(formatBranch);
}

function getActiveBranches() {
    const rows = all(`SELECT * FROM branches WHERE deleted_at IS NULL AND is_active = 1 ORDER BY order_index ASC, name ASC`);
    return rows.map(formatBranch);
}

function getBranchById(id) {
    const row = get(`SELECT * FROM branches WHERE id = ? AND deleted_at IS NULL`, [id]);
    return row ? formatBranch(row) : null;
}

function createBranch(data) {
    const { name, status, is_active, order_index } = data;
    const timestamps = createTimestamps();
    const id = crypto.randomUUID();

    run(
        `INSERT INTO branches (id, name, status, is_active, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, status || 'Available', is_active !== undefined ? (is_active ? 1 : 0) : 1, Number(order_index || 0), timestamps.createdAt, timestamps.updatedAt]
    );

    return getBranchById(id);
}

function updateBranch(id, data) {
    const updates = [];
    const params = [];
    const timestamps = createTimestamps();

    if (data.name !== undefined) { updates.push('name = ?'); params.push(data.name); }
    if (data.status !== undefined) { updates.push('status = ?'); params.push(data.status); }
    if (data.is_active !== undefined) { updates.push('is_active = ?'); params.push(data.is_active ? 1 : 0); }
    if (data.order_index !== undefined) { updates.push('order_index = ?'); params.push(Number(data.order_index)); }

    if (updates.length > 0) {
        updates.push('updated_at = ?');
        params.push(timestamps.updatedAt);
        params.push(id);
        
        run(`UPDATE branches SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`, params);
    }

    return getBranchById(id);
}

function deleteBranch(id) {
    const timestamps = createTimestamps();
    run(`UPDATE branches SET deleted_at = ? WHERE id = ?`, [timestamps.updatedAt, id]);
    return true;
}

module.exports = {
    getAllBranches,
    getActiveBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
};
