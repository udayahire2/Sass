const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config();

const requiredIfMissing = (value, message) => {
    if (!value) {
        throw new Error(message);
    }

    return value;
};

const parseList = (value, fallback) =>
    (value || fallback)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const env = {
    port: Number(process.env.PORT || 5001),
    nodeEnv: process.env.NODE_ENV || 'development',
    dbPath: path.resolve(process.cwd(), process.env.DB_PATH || './data/studyhub.sqlite'),
    jwtAccessSecret: requiredIfMissing(
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
        'JWT_ACCESS_SECRET or JWT_SECRET must be defined in .env'
    ),
    jwtRefreshSecret: requiredIfMissing(
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        'JWT_REFRESH_SECRET or JWT_SECRET must be defined in .env'
    ),
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
    bcryptRounds: Math.max(Number(process.env.BCRYPT_ROUNDS || 12), 12),
    refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'studyhub_refresh_token',
    corsOrigins: parseList(process.env.CORS_ORIGINS, 'http://localhost:5173,http://localhost:3000'),
    requestJsonLimit: process.env.REQUEST_JSON_LIMIT || '1mb',
    requestFormLimit: process.env.REQUEST_FORM_LIMIT || '1mb',
    redisUrl: process.env.REDIS_URL || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || 'NMU Study Hub <no-reply@nmu-studyhub.local>',
    adminEmail: process.env.ADMIN_EMAIL || '',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    adminName: process.env.ADMIN_NAME || 'Study Hub Admin',
    brevoApiKey: (process.env.BREVO_API_KEY || '').trim().replace(/^['"]|['"]$/g, ''),
    brevoFrom: process.env.BREVO_FROM || process.env.SMTP_USER || '',
    resendApiKey: (process.env.RESEND_API_KEY || '').trim().replace(/^['"]|['"]$/g, ''),
    resendFrom: process.env.RESEND_FROM || '',
};

module.exports = { env };
