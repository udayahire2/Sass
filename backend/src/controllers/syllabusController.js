const crypto = require('node:crypto');

const { createTimestamps, ensureSubject, formatSyllabus, get, run, all } = require('../services/dbService');
const { AppError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');

function getSyllabusRow(syllabusId) {
    return get(
        `SELECT *
         FROM syllabus
         WHERE id = ? AND deleted_at IS NULL`,
        [syllabusId]
    );
}

exports.getSyllabus = async (_req, res, next) => {
    try {
        const syllabus = all(
            `SELECT *
             FROM syllabus
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

        const syllabusType = req.body.syllabusType || req.body.typeMode || (req.body.semesters ? 'program' : 'subject');
        const programName = req.body.program || req.body.branch || 'General';
        const title = req.body.title || req.body.subjectName || `${programName} Syllabus`;
        const code = req.body.code || req.body.subjectCode || req.body.courseCode || '';
        const semester = req.body.semester ? String(req.body.semester) : '';
        const year = req.body.year || req.body.academicYear || '';
        const contentType = req.body.type || 'pdf';
        const contentUrl = req.body.contentUrl || '';
        const description = req.body.description || '';

        let semestersJson = null;
        if (req.body.semesters) {
            semestersJson = typeof req.body.semesters === 'string'
                ? req.body.semesters
                : JSON.stringify(req.body.semesters);
        }

        let topicsJson = null;
        if (req.body.topics) {
            topicsJson = typeof req.body.topics === 'string'
                ? req.body.topics
                : JSON.stringify(req.body.topics);
        }

        let learningOutcomesJson = null;
        if (req.body.learningOutcomes) {
            learningOutcomesJson = typeof req.body.learningOutcomes === 'string'
                ? req.body.learningOutcomes
                : JSON.stringify(req.body.learningOutcomes);
        }

        let textbooksJson = null;
        if (req.body.textbooks) {
            textbooksJson = typeof req.body.textbooks === 'string'
                ? req.body.textbooks
                : JSON.stringify(req.body.textbooks);
        }

        let assessmentSchemeJson = null;
        if (req.body.assessmentScheme) {
            assessmentSchemeJson = typeof req.body.assessmentScheme === 'string'
                ? req.body.assessmentScheme
                : JSON.stringify(req.body.assessmentScheme);
        }

        let referencesJson = null;
        if (req.body.references) {
            referencesJson = typeof req.body.references === 'string'
                ? req.body.references
                : JSON.stringify(req.body.references);
        }

        const subjectId = (syllabusType === 'subject' && semester && code)
            ? ensureSubject({
                branch: programName,
                code,
                credits: Number(req.body.credits || 0),
                semester,
                title,
                description,
            })
            : null;

        run(
            `INSERT INTO syllabus (
                id, subject_id, title, code, branch, semester, academic_year, type, credits, content_url,
                syllabus_type, program, subject_name, subject_code, semesters, description,
                topics, learning_outcomes, textbooks, assessment_scheme, references_list,
                created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
            [
                syllabusId,
                subjectId,
                title,
                code,
                programName,
                semester,
                year,
                contentType,
                Number(req.body.credits || 0),
                contentUrl,
                syllabusType,
                programName,
                req.body.subjectName || title,
                code,
                semestersJson,
                description,
                topicsJson,
                learningOutcomesJson,
                textbooksJson,
                assessmentSchemeJson,
                referencesJson,
                timestamps.createdAt,
                timestamps.updatedAt,
            ]
        );

        const syllabus = formatSyllabus(getSyllabusRow(syllabusId));
        return sendSuccess(res, {
            statusCode: 201,
            message: `${syllabusType === 'program' ? 'Program-level' : 'Subject-level'} syllabus created successfully`,
            data: syllabus,
        });
    } catch (error) {
        console.error('Error creating syllabus in controller:', error);
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
            `UPDATE syllabus
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
