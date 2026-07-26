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
    const resendApiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : '';
    const brevoApiKey = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : '';

    // 1. Brevo HTTP REST API (Allows sending to ANY recipient email without domain restrictions, 300 free/day)
    if (brevoApiKey) {
        try {
            console.log(`[MAIL] Attempting HTTPS API send to ${email} via Brevo...`);
            const senderEmail = env.smtpUser || process.env.BREVO_FROM || 'nmustudyhub@gmail.com';
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': brevoApiKey,
                },
                body: JSON.stringify({
                    sender: { name: 'NMU Study Hub', email: senderEmail },
                    to: [{ email }],
                    subject,
                    textContent: message,
                    htmlContent: html,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || JSON.stringify(data));
            }
            console.log(`[MAIL SUCCESS] Email sent via Brevo HTTP API to ${email}. ID: ${data.messageId || 'ok'}`);
            return { delivered: true, fallback: false };
        } catch (err) {
            console.error(`[MAIL ERROR] Brevo HTTP API failed to send to ${email}:`, err.message || err);
            throw err;
        }
    }

    // 2. Resend HTTP REST API (Note: Resend free trial only allows sending to the account owner email until domain is verified)
    if (resendApiKey) {
        try {
            console.log(`[MAIL] Attempting HTTPS API send to ${email} via Resend...`);
            const sender = process.env.RESEND_FROM || 'NMU Study Hub <onboarding@resend.dev>';
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                    from: sender,
                    to: [email],
                    subject,
                    text: message,
                    html,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || JSON.stringify(data));
            }
            console.log(`[MAIL SUCCESS] Email sent via Resend HTTP API to ${email}. ID: ${data.id}`);
            return { delivered: true, fallback: false };
        } catch (err) {
            console.error(`[MAIL ERROR] Resend HTTP API failed to send to ${email}:`, err.message || err);
            throw err;
        }
    }

    // 3. Fallback to Nodemailer SMTP (Note: Render free tier blocks outbound SMTP ports 25, 465, 587)
    const mailer = getTransporter();

    if (!mailer) {
        console.log(`[MAIL FALLBACK] Mail provider not configured. To: ${email} | Subject: ${subject}`);
        return { delivered: false, fallback: true };
    }

    const cleanUser = String(env.smtpUser || '').trim();
    const fromAddress = (env.smtpFrom && !env.smtpFrom.includes('no-reply@nmu-studyhub.local'))
        ? env.smtpFrom
        : `NMU Study Hub <${cleanUser || 'no-reply@nmu-studyhub.local'}>`;

    try {
        console.log(`[MAIL] Attempting SMTP send to ${email}...`);
        const info = await mailer.sendMail({
            from: fromAddress,
            to: email,
            subject,
            text: message,
            html,
        });
        console.log(`[MAIL SUCCESS] Email sent successfully via SMTP to ${email}. MessageID: ${info.messageId}`);
        return { delivered: true, fallback: false };
    } catch (err) {
        console.error(`[MAIL ERROR] Failed to send email via SMTP to ${email}:`, err.message || err);
        throw err;
    }
}

module.exports = sendEmail;
