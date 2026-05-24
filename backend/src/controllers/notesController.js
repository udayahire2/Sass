const { run, get, all } = require('../services/dbService');
const { AppError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');
const crypto = require('node:crypto');
const { nowIso } = require('../utils/date');

// GET /api/v1/notes
exports.getNotes = (req, res, next) => {
    try {
        const notes = all(
            `SELECT * FROM student_notes WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC`,
            [req.user.id]
        );
        return sendSuccess(res, {
            message: 'Notes fetched successfully',
            data: notes,
        });
    } catch (error) {
        return next(error);
    }
};

// GET /api/v1/notes/:id
exports.getNoteById = (req, res, next) => {
    try {
        const id = req.params.id;
        const note = get(
            `SELECT * FROM student_notes WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );

        if (!note) {
            return next(new AppError('Note not found', 404));
        }

        if (note.user_id !== req.user.id) {
            return next(new AppError('Unauthorized', 403));
        }

        return sendSuccess(res, {
            message: 'Note fetched successfully',
            data: note,
        });
    } catch (error) {
        return next(error);
    }
};

// POST /api/v1/notes
exports.createNote = (req, res, next) => {
    try {
        const { title, content_markdown, topic_id } = req.body;
        
        const finalTitle = title ? title : 'Untitled';

        const id = crypto.randomUUID();
        const timestamp = nowIso();

        run(
            `INSERT INTO student_notes (id, user_id, topic_id, title, content_markdown, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, req.user.id, topic_id || null, finalTitle, content_markdown || '', timestamp, timestamp]
        );

        const newNote = get(`SELECT * FROM student_notes WHERE id = ?`, [id]);

        return sendSuccess(res, {
            message: 'Note created successfully',
            data: newNote,
        });
    } catch (error) {
        return next(error);
    }
};

// PUT /api/v1/notes/:id
exports.updateNote = (req, res, next) => {
    try {
        const { title, content_markdown, topic_id } = req.body;
        const id = req.params.id;

        const note = get(`SELECT * FROM student_notes WHERE id = ? AND deleted_at IS NULL`, [id]);

        if (!note) {
            return next(new AppError('Note not found', 404));
        }

        if (note.user_id !== req.user.id) {
            return next(new AppError('Unauthorized', 403));
        }

        const timestamp = nowIso();
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
        if (topic_id !== undefined) {
            updates.push('topic_id = ?');
            params.push(topic_id);
        }

        if (updates.length > 0) {
            updates.push('updated_at = ?');
            params.push(timestamp);
            params.push(id);
            run(`UPDATE student_notes SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        const updatedNote = get(`SELECT * FROM student_notes WHERE id = ?`, [id]);

        return sendSuccess(res, {
            message: 'Note updated successfully',
            data: updatedNote,
        });
    } catch (error) {
        return next(error);
    }
};

// PATCH /api/v1/notes/:id/rename
exports.renameNote = (req, res, next) => {
    try {
        const { title } = req.body;
        const id = req.params.id;

        if (title === undefined || title === null) {
            return next(new AppError('Title is required', 400));
        }

        const note = get(`SELECT * FROM student_notes WHERE id = ? AND deleted_at IS NULL`, [id]);

        if (!note) {
            return next(new AppError('Note not found', 404));
        }

        if (note.user_id !== req.user.id) {
            return next(new AppError('Unauthorized', 403));
        }

        const timestamp = nowIso();
        run(`UPDATE student_notes SET title = ?, updated_at = ? WHERE id = ?`, [title || 'Untitled', timestamp, id]);

        const updatedNote = get(`SELECT * FROM student_notes WHERE id = ?`, [id]);

        return sendSuccess(res, {
            message: 'Note renamed successfully',
            data: updatedNote,
        });
    } catch (error) {
        return next(error);
    }
};

// DELETE /api/v1/notes/:id
exports.deleteNote = (req, res, next) => {
    try {
        const id = req.params.id;
        const note = get(`SELECT * FROM student_notes WHERE id = ? AND deleted_at IS NULL`, [id]);

        if (!note) {
            return next(new AppError('Note not found', 404));
        }

        if (note.user_id !== req.user.id) {
            return next(new AppError('Unauthorized', 403));
        }

        const timestamp = nowIso();
        run(`UPDATE student_notes SET deleted_at = ? WHERE id = ?`, [timestamp, id]);

        return sendSuccess(res, {
            message: 'Note deleted successfully',
        });
    } catch (error) {
        return next(error);
    }
};
