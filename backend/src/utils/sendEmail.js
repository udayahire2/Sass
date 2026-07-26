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

    transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: {
            user: env.smtpUser,
            pass: env.smtpPass,
        },
    });

    return transporter;
}

async function sendEmail({ email, subject, message, html }) {
    const mailer = getTransporter();

    if (!mailer) {
        console.log(`[MAIL FALLBACK] To: ${email} | Subject: ${subject} | Message: ${message}`);
        return { delivered: false, fallback: true };
    }

    const fromAddress = (env.smtpFrom && !env.smtpFrom.includes('no-reply@nmu-studyhub.local'))
        ? env.smtpFrom
        : `NMU Study Hub <${env.smtpUser || 'no-reply@nmu-studyhub.local'}>`;

    await mailer.sendMail({
        from: fromAddress,
        to: email,
        subject,
        text: message,
        html,
    });

    return { delivered: true, fallback: false };
}

module.exports = sendEmail;
