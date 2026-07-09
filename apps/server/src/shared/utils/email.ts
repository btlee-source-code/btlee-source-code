/**
 * Email Service
 * Sends transactional emails (listing approved/rejected, password reset, etc).
 *
 * Two delivery paths, picked automatically:
 *   - If RESEND_API_KEY is set → send via Resend's HTTP API (port 443). Use this
 *     on hosts that block outbound SMTP ports (e.g. Railway blocks 25/465/587).
 *   - Otherwise → send via SMTP (nodemailer). Works fine locally.
 */
import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

const useResend = Boolean(env.RESEND_API_KEY);

// ---- SMTP transport (only built/verified when we're actually using SMTP) ----
const transporter = useResend
  ? null
  : nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

if (transporter) {
  // Verify SMTP creds once at startup so a misconfiguration shows up LOUDLY.
  transporter.verify().then(
    () => console.log('[EMAIL] SMTP transport ready — emails can be sent'),
    (err: unknown) =>
      console.error(
        '[EMAIL] SMTP verification FAILED — no emails will be delivered. ' +
          'Check SMTP_USER/SMTP_PASS and SMTP_HOST/PORT (note: some hosts block SMTP).',
        err instanceof Error ? err.message : err
      )
  );
} else {
  console.log('[EMAIL] Using Resend HTTP API for delivery');
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Send via Resend's HTTP API — works where SMTP ports are blocked. */
async function sendViaResend(options: SendEmailOptions): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(options.text ? { text: options.text } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend API ${res.status}: ${detail}`);
  }
}

/** Send via SMTP (nodemailer). */
async function sendViaSmtp(options: SendEmailOptions): Promise<void> {
  await transporter!.sendMail({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    if (useResend) {
      await sendViaResend(options);
    } else {
      await sendViaSmtp(options);
    }
  } catch (error) {
    // Email failures should not break the main request — log and continue.
    console.error('[EMAIL] Failed to send:', error);
  }
}
