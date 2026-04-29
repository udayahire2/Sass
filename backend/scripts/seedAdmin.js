const { ensureDefaultAdmin } = require('../src/services/bootstrapService');

ensureDefaultAdmin()
    .then(() => {
        console.log('Admin seed completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Admin seed failed', error);
        process.exit(1);
    });
