<<<<<<< HEAD
import nodemailer from "nodemailer";

const host = process.env.EMAIL_HOST!;
const port = Number(process.env.EMAIL_PORT!);
const user = process.env.EMAIL_USER!;
const pass = process.env.EMAIL_PASS!;

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  pool: true,
  maxConnections: 1,
  maxMessages: 50,
  auth: {
    user,
    pass,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: '"Bloxhop Support" <support@bloxhop.site>',
    to,
    subject,
    html,
  });
}

export async function sendEmailsIndividually({
  recipients,
  subject,
  html,
}: {
  recipients: string[];
  subject: string;
  html: string;
}) {
  const seen = new Set<string>();
  const uniqueRecipients = recipients
    .map((email) => email.trim().toLowerCase())
    .filter((email) => {
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];

  for (const email of uniqueRecipients) {
    try {
      await sendEmail({ to: email, subject, html });
      results.push({ email, ok: true });
    } catch (error) {
      console.error(`Email send failed for ${email}:`, error);
      results.push({
        email,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return results;
=======
import nodemailer from "nodemailer";

const host = process.env.EMAIL_HOST!;
const port = Number(process.env.EMAIL_PORT!);
const user = process.env.EMAIL_USER!;
const pass = process.env.EMAIL_PASS!;

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  pool: true,
  maxConnections: 1,
  maxMessages: 50,
  auth: {
    user,
    pass,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: '"Bloxhop Support" <support@bloxhop.site>',
    to,
    subject,
    html,
  });
}

export async function sendEmailsIndividually({
  recipients,
  subject,
  html,
}: {
  recipients: string[];
  subject: string;
  html: string;
}) {
  const seen = new Set<string>();
  const uniqueRecipients = recipients
    .map((email) => email.trim().toLowerCase())
    .filter((email) => {
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];

  for (const email of uniqueRecipients) {
    try {
      await sendEmail({ to: email, subject, html });
      results.push({ email, ok: true });
    } catch (error) {
      console.error(`Email send failed for ${email}:`, error);
      results.push({
        email,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return results;
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
}