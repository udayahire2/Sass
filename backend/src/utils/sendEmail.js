const nodemailer = require('nodemailer');

const { env } = require('../config/env');

let transporter;

/**
 * Mask sensitive API key for safe logging.
 * Shows first 7 and last 4 characters, masking the rest.
 */
function maskKey(key) {
    if (!key) return '(not set)';
    const clean = String(key).trim().replace(/^['"]|['"]$/g, '');
    if (clean.length <= 8) return '***';
    return `${clean.slice(0, 7)}...${clean.slice(-4)}`;
}

// Log email provider status on module load
(function logMailConfigOnStartup() {
    const brevoKey = env.brevoApiKey || (process.env.BREVO_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
    const resendKey = env.resendApiKey || (process.env.RESEND_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');

    if (brevoKey) {
        console.log(`[MAIL CONFIG] Brevo API Key loaded: ${maskKey(brevoKey)} (Length: ${brevoKey.length})`);
    } else if (resendKey) {
        console.log(`[MAIL CONFIG] Resend API Key loaded: ${maskKey(resendKey)}`);
    } else if (env.smtpHost && env.smtpUser) {
        console.log(`[MAIL CONFIG] Nodemailer SMTP configured for host: ${env.smtpHost}, user: ${env.smtpUser}`);
    } else {
        console.warn(`[MAIL CONFIG WARNING] No email API key (BREVO_API_KEY / RESEND_API_KEY) or SMTP credentials set.`);
    }
})();

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
    const brevoApiKey = (env.brevoApiKey || process.env.BREVO_API_KEY || '')
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .replace(/\r?\n|\r/g, '');

    const resendApiKey = (env.resendApiKey || process.env.RESEND_API_KEY || '')
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .replace(/\r?\n|\r/g, '');

    // 1. Brevo HTTP REST API (Bypasses Render SMTP port restrictions, 300 free emails/day)
    if (brevoApiKey) {
        try {
            let senderEmail = (env.brevoFrom || env.smtpUser || process.env.BREVO_FROM || env.adminEmail || '').trim();
            if (!senderEmail || !senderEmail.includes('@')) {
                senderEmail = 'no-reply@nmu-studyhub.com';
            }

            console.log(`[MAIL] Attempting HTTPS API send to ${email} via Brevo (Sender: ${senderEmail}, Key: ${maskKey(brevoApiKey)})...`);

            const payload = {
                sender: {
                    name: 'NMU Study Hub',
                    email: senderEmail,
                },
                to: [
                    {
                        email: email.trim(),
                    },
                ],
                subject,
                htmlContent: html || `<p>${message}</p>`,
                textContent: message || '',
            };

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'api-key': brevoApiKey,
                },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                responseData = { raw: responseText };
            }

            if (!response.ok) {
                const brevoCode = responseData.code || 'UNAUTHORIZED_OR_INVALID_KEY';
                const brevoMsg = responseData.message || responseText || 'No error message provided';

                console.error(`[MAIL ERROR] Brevo API HTTP ${response.status} ${response.statusText}`);
                console.error(`[MAIL ERROR] Brevo Error Code: ${brevoCode}`);
                console.error(`[MAIL ERROR] Brevo Full Response:`, responseText);

                throw new Error(`Brevo HTTP ${response.status} [${brevoCode}]: ${brevoMsg}`);
            }

            const messageId = responseData.messageId || responseData.id || 'success';
            console.log(`[MAIL SUCCESS] Email sent via Brevo HTTP API to ${email}. MessageID: ${messageId}`);
            return { delivered: true, fallback: false, provider: 'brevo', messageId };
        } catch (err) {
            console.error(`[MAIL ERROR] Brevo HTTP API failed to send to ${email}:`, err.message);
            throw err;
        }
    }

    // 2. Resend HTTP REST API (Fallback if Brevo key not set)
    if (resendApiKey) {
        try {
            console.log(`[MAIL] Attempting HTTPS API send to ${email} via Resend (Key: ${maskKey(resendApiKey)})...`);
            const sender = env.resendFrom || process.env.RESEND_FROM || 'NMU Study Hub <onboarding@resend.dev>';
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

            const responseText = await res.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                responseData = { raw: responseText };
            }

            if (!res.ok) {
                const resendMsg = responseData.message || responseText;
                console.error(`[MAIL ERROR] Resend API HTTP ${res.status}:`, responseText);
                throw new Error(`Resend HTTP ${res.status}: ${resendMsg}`);
            }

            console.log(`[MAIL SUCCESS] Email sent via Resend HTTP API to ${email}. ID: ${responseData.id}`);
            return { delivered: true, fallback: false, provider: 'resend', messageId: responseData.id };
        } catch (err) {
            console.error(`[MAIL ERROR] Resend HTTP API failed to send to ${email}:`, err.message);
            throw err;
        }
    }

    // 3. Fallback to Nodemailer SMTP
    const mailer = getTransporter();

    if (!mailer) {
        console.log(`[MAIL FALLBACK] No email provider configured. To: ${email} | Subject: ${subject}`);
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
        return { delivered: true, fallback: false, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
        console.error(`[MAIL ERROR] Failed to send email via SMTP to ${email}:`, err.message);
        throw err;
    }
}

module.exports = sendEmail;
