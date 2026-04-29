const dotenv = require('dotenv');
const path = require('node:path');

const { getDatabase } = require('../src/config/database');
const { runMigrations } = require('../src/services/bootstrapService');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
    try {
        await runMigrations();
        const db = getDatabase();

        const totalUsers = db
            .prepare(
                `SELECT COUNT(*) AS count
                 FROM users
                 WHERE deleted_at IS NULL`
            )
            .get().count;

        console.log(`Total Users: ${totalUsers}`);

        const usersByRole = db
            .prepare(
                `SELECT role, COUNT(*) AS count
                 FROM users
                 WHERE deleted_at IS NULL
                 GROUP BY role
                 ORDER BY role ASC`
            )
            .all();

        console.log('\nUsers by Role:');
        usersByRole.forEach((role) => {
            console.log(`- ${role.role}: ${role.count}`);
        });

        const facultyDetails = db
            .prepare(
                `SELECT
                    TRIM(first_name || ' ' || last_name) AS name,
                    email,
                    is_approved
                 FROM users
                 WHERE role = 'faculty' AND deleted_at IS NULL
                 ORDER BY created_at DESC`
            )
            .all();

        console.log('\nFaculty Details:');
        facultyDetails.forEach((faculty) => {
            console.log(`- ${faculty.name} (${faculty.email}): ${faculty.is_approved ? 'Approved' : 'Pending'}`);
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    }
}

main();
