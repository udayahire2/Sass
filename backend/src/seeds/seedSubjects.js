const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const { runMigrations } = require('../services/bootstrapService');
const { createTimestamps, get, run, transaction } = require('../services/dbService');

const rootDir = path.resolve(__dirname, '../../../');
const studyDataPath = path.join(rootDir, 'app/src/data/study-data.ts');
const typescriptPath = path.join(rootDir, 'app/node_modules/typescript');

function loadStudyData() {
    if (!fs.existsSync(studyDataPath)) {
        throw new Error(`Study data file not found at ${studyDataPath}`);
    }

    if (!fs.existsSync(typescriptPath)) {
        throw new Error('TypeScript is required in app/node_modules to seed from study-data.ts');
    }

    const ts = require(typescriptPath);
    const source = fs.readFileSync(studyDataPath, 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
            esModuleInterop: true,
        },
    }).outputText;

    const sandbox = {
        exports: {},
        module: { exports: {} },
        require,
    };

    vm.runInNewContext(compiled, sandbox, { filename: studyDataPath });
    return sandbox.module.exports.SUBJECTS_DB || sandbox.exports.SUBJECTS_DB || [];
}

function ensureSubject(subject) {
    const timestamps = createTimestamps();
    run(
        `INSERT INTO subjects (
            id, code, title, branch, semester, credits, description, created_at, updated_at, deleted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
        ON CONFLICT(code, branch, semester) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            updated_at = excluded.updated_at,
            deleted_at = NULL`,
        [
            subject.id || crypto.randomUUID(),
            subject.code,
            subject.name,
            subject.branch,
            Number(subject.semester),
            subject.credits || 0,
            subject.description || null,
            timestamps.createdAt,
            timestamps.updatedAt,
        ]
    );

    return get(
        `SELECT *
         FROM subjects
         WHERE code = ? AND branch = ? AND semester = ? AND deleted_at IS NULL`,
        [subject.code, subject.branch, Number(subject.semester)]
    );
}

function resetSubjectUnits(subjectId) {
    run(
        `DELETE FROM topics
         WHERE unit_id IN (
            SELECT id FROM units WHERE subject_id = ?
         )`,
        [subjectId]
    );
    run('DELETE FROM units WHERE subject_id = ?', [subjectId]);
}

function toVideoUrl(topic) {
    if (topic.videoUrl) {
        return topic.videoUrl;
    }

    if (topic.youtubeVideoId) {
        return `https://www.youtube.com/watch?v=${topic.youtubeVideoId}`;
    }

    return null;
}

async function main() {
    await runMigrations();
    const subjects = loadStudyData();

    let unitCount = 0;
    let topicCount = 0;

    transaction(() => {
        for (const subject of subjects) {
            const subjectRow = ensureSubject(subject);
            resetSubjectUnits(subjectRow.id);

            for (const unit of subject.units || []) {
                const unitId = unit.id || crypto.randomUUID();
                const timestamps = createTimestamps();
                run(
                    `INSERT INTO units (
                        id, subject_id, unit_number, title, description, created_at, deleted_at
                    ) VALUES (?, ?, ?, ?, ?, ?, NULL)`,
                    [
                        unitId,
                        subjectRow.id,
                        Number(unit.number),
                        unit.title,
                        unit.description || null,
                        timestamps.createdAt,
                    ]
                );
                unitCount += 1;

                for (const topic of unit.topics || []) {
                    const topicId = topic.id || crypto.randomUUID();
                    run(
                        `INSERT INTO topics (
                            id, unit_id, title, content_markdown, video_url, created_at, deleted_at
                        ) VALUES (?, ?, ?, ?, ?, ?, NULL)`,
                        [
                            topicId,
                            unitId,
                            topic.title,
                            topic.markdownContent || topic.contentMarkdown || '',
                            toVideoUrl(topic),
                            timestamps.createdAt,
                        ]
                    );
                    topicCount += 1;
                }
            }
        }
    });

    console.log(`Seeded ${subjects.length} subjects, ${unitCount} units, and ${topicCount} topics.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
