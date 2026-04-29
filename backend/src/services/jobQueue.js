const crypto = require('node:crypto');

const sendEmail = require('../utils/sendEmail');
const { createTimestamps, get, run } = require('./dbService');

let workerStarted = false;

function enqueueJob(type, payload, availableAt = new Date().toISOString()) {
    const timestamps = createTimestamps();
    const jobId = crypto.randomUUID();

    run(
        `INSERT INTO jobs (
            id, type, payload_json, status, attempts, max_attempts, available_at,
            processed_at, error_message, created_at, updated_at, deleted_at
        ) VALUES (?, ?, ?, 'pending', 0, 5, ?, NULL, NULL, ?, ?, NULL)`,
        [
            jobId,
            type,
            JSON.stringify(payload),
            availableAt,
            timestamps.createdAt,
            timestamps.updatedAt,
        ]
    );

    return jobId;
}

async function processJob(job) {
    const payload = JSON.parse(job.payload_json);

    if (job.type === 'email.send') {
        await sendEmail(payload);
        return;
    }

    if (job.type === 'notification.log') {
        console.log(`[NOTIFICATION] ${payload.message}`);
        return;
    }

    throw new Error(`Unsupported job type "${job.type}"`);
}

async function processNextJob() {
    const job = get(
        `SELECT *
         FROM jobs
         WHERE status = 'pending'
           AND deleted_at IS NULL
           AND available_at <= ?
         ORDER BY created_at ASC
         LIMIT 1`,
        [new Date().toISOString()]
    );

    if (!job) {
        return;
    }

    run(
        `UPDATE jobs
         SET status = 'processing', attempts = attempts + 1, updated_at = ?
         WHERE id = ?`,
        [new Date().toISOString(), job.id]
    );

    try {
        await processJob(job);
        run(
            `UPDATE jobs
             SET status = 'completed', processed_at = ?, updated_at = ?
             WHERE id = ?`,
            [new Date().toISOString(), new Date().toISOString(), job.id]
        );
    } catch (error) {
        const attempts = job.attempts + 1;
        const nextStatus = attempts >= job.max_attempts ? 'failed' : 'pending';
        run(
            `UPDATE jobs
             SET status = ?, error_message = ?, available_at = ?, updated_at = ?
             WHERE id = ?`,
            [
                nextStatus,
                error.message,
                new Date(Date.now() + 30_000).toISOString(),
                new Date().toISOString(),
                job.id,
            ]
        );
    }
}

function startJobWorker() {
    if (workerStarted) {
        return;
    }

    workerStarted = true;
    setInterval(() => {
        processNextJob().catch((error) => {
            console.error('Job worker error', error);
        });
    }, 2000);
}

module.exports = { enqueueJob, startJobWorker };
