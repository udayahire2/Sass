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
        const { title, topic_id, icon, cover, is_favorite, is_trash, parent_id, font, full_width } = req.body;
        
        const baseTitle = title ? title : 'Untitled';
        let finalTitle = baseTitle;

        // Auto-generate unique title if it already exists
        const existingNotes = all(
            `SELECT title FROM student_notes WHERE user_id = ? AND title LIKE ? AND deleted_at IS NULL`,
            [req.user.id, `${baseTitle}%`]
        );

        if (existingNotes.length > 0) {
            let maxSuffix = 0;
            let exactMatch = false;

            for (const note of existingNotes) {
                if (note.title === baseTitle) {
                    exactMatch = true;
                } else {
                    const match = note.title.substring(baseTitle.length).match(/^(\d+)$/);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (num > maxSuffix) {
                            maxSuffix = num;
                        }
                    }
                }
            }

            if (exactMatch || maxSuffix > 0) {
                finalTitle = `${baseTitle}${maxSuffix + 1}`;
            }
        }

        const id = crypto.randomUUID();
        const timestamp = nowIso();

        run(
            `INSERT INTO student_notes (id, user_id, topic_id, title, content_markdown, icon, cover, is_favorite, is_trash, parent_id, font, full_width, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, 
                req.user.id, 
                topic_id || null, 
                finalTitle, 
                '', // Force empty content to avoid inheriting old data
                icon || null, 
                cover || null, 
                is_favorite ? 1 : 0, 
                is_trash ? 1 : 0, 
                parent_id || null, 
                font || 'sans', 
                full_width ? 1 : 0, 
                timestamp, 
                timestamp
            ]
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
        const { title, content_markdown, topic_id, icon, cover, is_favorite, is_trash, parent_id, font, full_width } = req.body;
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
        if (icon !== undefined) {
            updates.push('icon = ?');
            params.push(icon);
        }
        if (cover !== undefined) {
            updates.push('cover = ?');
            params.push(cover);
        }
        if (is_favorite !== undefined) {
            updates.push('is_favorite = ?');
            params.push(is_favorite ? 1 : 0);
        }
        if (is_trash !== undefined) {
            updates.push('is_trash = ?');
            params.push(is_trash ? 1 : 0);
        }
        if (parent_id !== undefined) {
            updates.push('parent_id = ?');
            params.push(parent_id);
        }
        if (font !== undefined) {
            updates.push('font = ?');
            params.push(font);
        }
        if (full_width !== undefined) {
            updates.push('full_width = ?');
            params.push(full_width ? 1 : 0);
        }

        if (updates.length > 0) {
            updates.push('updated_at = ?');
            params.push(timestamp);
            params.push(id);
            run(`UPDATE student_notes SET ${updates.join(', ')} WHERE id = ?`, params);
            
            // Cascade is_trash to children
            if (is_trash !== undefined) {
                const trashValue = is_trash ? 1 : 0;
                run(`
                    UPDATE student_notes 
                    SET is_trash = ?, updated_at = ? 
                    WHERE id IN (
                        WITH RECURSIVE descendants AS (
                            SELECT id FROM student_notes WHERE parent_id = ?
                            UNION ALL
                            SELECT sn.id FROM student_notes sn
                            INNER JOIN descendants d ON sn.parent_id = d.id
                        )
                        SELECT id FROM descendants
                    )
                `, [trashValue, timestamp, id]);
            }
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
        run(`
            UPDATE student_notes 
            SET deleted_at = ? 
            WHERE id IN (
                WITH RECURSIVE descendants AS (
                    SELECT id FROM student_notes WHERE id = ?
                    UNION ALL
                    SELECT sn.id FROM student_notes sn
                    INNER JOIN descendants d ON sn.parent_id = d.id
                )
                SELECT id FROM descendants
            )
        `, [timestamp, id]);

        return sendSuccess(res, {
            message: 'Note deleted successfully',
        });
    } catch (error) {
        return next(error);
    }
};
