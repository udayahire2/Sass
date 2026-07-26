const nodemailer = require('nodemailer');

const { env } = require('../config/env');

let transporter;

function getTransporter() {
    if (transporter) {
        return transporter;
    }

    if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
        return null;
    }

    const host = String(env.smtpHost).trim().toLowerCase();
    const cleanUser = String(env.smtpUser).trim();
    const cleanPass = String(env.smtpPass).trim().replace(/\s+/g, '');

    // For Gmail accounts, using service: 'gmail' uses Port 465 SSL directly,
    // avoiding outbound port 587 STARTTLS timeouts on cloud providers like Render.
    if (host.includes('gmail') || cleanUser.endsWith('@gmail.com')) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: cleanUser,
                pass: cleanPass,
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 15000,
        });
    } else {
        const isSecure = Number(env.smtpPort) === 465;
        transporter = nodemailer.createTransport({
            host: env.smtpHost.trim(),
            port: Number(env.smtpPort || 587),
            secure: isSecure,
            auth: {
                user: cleanUser,
                pass: cleanPass,
            },
            tls: {
                rejectUnauthorized: false,
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 15000,
        });
    }

    return transporter;
}

async function sendEmail({ email, subject, message, html }) {
    const mailer = getTransporter();

    if (!mailer) {
        console.log(`[MAIL FALLBACK] SMTP not configured (SMTP_HOST/USER/PASS missing). To: ${email} | Subject: ${subject}`);
        return { delivered: false, fallback: true };
    }

    const cleanUser = String(env.smtpUser || '').trim();
    const fromAddress = (env.smtpFrom && !env.smtpFrom.includes('no-reply@nmu-studyhub.local'))
        ? env.smtpFrom
        : `NMU Study Hub <${cleanUser || 'no-reply@nmu-studyhub.local'}>`;

    try {
        console.log(`[MAIL] Attempting to send email to ${email} via ${env.smtpHost}:${env.smtpPort}...`);
        const info = await mailer.sendMail({
            from: fromAddress,
            to: email,
            subject,
            text: message,
            html,
        });
        console.log(`[MAIL SUCCESS] Email sent successfully to ${email}. MessageID: ${info.messageId}`);
        return { delivered: true, fallback: false };
    } catch (err) {
        console.error(`[MAIL ERROR] Failed to send email to ${email}:`, err.message || err);
        throw err;
    }
}

module.exports = sendEmail;
