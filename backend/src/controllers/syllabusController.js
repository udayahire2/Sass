const crypto = require('node:crypto');

const { createTimestamps, ensureSubject, formatSyllabus, get, run, all } = require('../services/dbService');
const { AppError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');

function getSyllabusRow(syllabusId) {
    return get(
        `SELECT *
         FROM syllabi
         WHERE id = ? AND deleted_at IS NULL`,
        [syllabusId]
    );
}

exports.getSyllabus = async (_req, res, next) => {
    try {
        const syllabus = all(
            `SELECT *
             FROM syllabi
             WHERE deleted_at IS NULL
             ORDER BY branch ASC, CAST(semester AS INTEGER) ASC, CAST(academic_year AS INTEGER) ASC, code ASC`
        ).map((row) => formatSyllabus(row));

        return sendSuccess(res, {
            message: 'Syllabus fetched successfully',
            data: syllabus,
            legacy: {
                syllabus,
            },
        });
    } catch (error) {
        return next(error);
    }
};

exports.createSyllabus = async (req, res, next) => {
    try {
        const timestamps = createTimestamps();
        const syllabusId = crypto.randomUUID();
        const subjectId = req.body.semester
            ? ensureSubject({
                branch: req.body.branch,
                code: req.body.code,
                credits: 0,
                semester: req.body.semester,
                title: req.body.title,
            })
            : null;

        run(
            `INSERT INTO syllabi (
                id, subject_id, title, code, branch, semester, academic_year, type, credits, content_url, created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
            [
                syllabusId,
                subjectId,
                req.body.title,
                req.body.code,
                req.body.branch,
                req.body.semester ?? '',
                req.body.year ?? null,
                req.body.type,
                0,
                req.body.contentUrl,
                timestamps.createdAt,
                timestamps.updatedAt,
            ]
        );

        const syllabus = formatSyllabus(getSyllabusRow(syllabusId));
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Syllabus created successfully',
            data: syllabus,
        });
    } catch (error) {
        return next(error);
    }
};

exports.deleteSyllabus = async (req, res, next) => {
    try {
        const syllabus = getSyllabusRow(req.params.id);

        if (!syllabus) {
            return next(new AppError('Syllabus not found', 404));
        }

        const timestamps = createTimestamps();
        run(
            `UPDATE syllabi
             SET deleted_at = ?, updated_at = ?
             WHERE id = ?`,
            [timestamps.updatedAt, timestamps.updatedAt, syllabus.id]
        );

        return sendSuccess(res, {
            message: 'Syllabus deleted successfully',
            data: {},
        });
    } catch (error) {
        return next(error);
    }
};
