import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../config";
import { getSmtpUsageToday } from "../db/db";
import type { SmtpAccountConfig } from "../types";

const transporters = new Map<string, Transporter>();

function getTransporter(account: SmtpAccountConfig): Transporter {
  let t = transporters.get(account.key);
  if (!t) {
    t = nodemailer.createTransport({
      host: account.host,
      port: account.port,
      secure: account.secure,
      auth: { user: account.user, pass: account.pass },
    });
    transporters.set(account.key, t);
  }
  return t;
}

/**
 * Picks the next SMTP account with remaining daily quota, round-robin by
 * lowest usage first so volume spreads evenly across all configured inboxes.
 */
export function pickAvailableAccount(): SmtpAccountConfig | null {
  const candidates = config.smtpAccounts
    .map((account) => ({ account, used: getSmtpUsageToday(account.key) }))
    .filter(({ used }) => used < config.maxEmailsPerSmtpPerDay)
    .sort((a, b) => a.used - b.used);

  return candidates[0]?.account ?? null;
}

export function getRemainingCapacityToday(): number {
  return config.smtpAccounts.reduce((total, account) => {
    const used = getSmtpUsageToday(account.key);
    return total + Math.max(0, config.maxEmailsPerSmtpPerDay - used);
  }, 0);
}

export async function sendMail(
  account: SmtpAccountConfig,
  mail: { to: string; subject: string; text: string }
): Promise<{ messageId: string }> {
  const transporter = getTransporter(account);
  const info = await transporter.sendMail({
    from: `"${account.fromName}" <${account.fromEmail}>`,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
  });
  return { messageId: info.messageId };
}

export function randomSendDelayMs(): number {
  const { minSendDelayMs, maxSendDelayMs } = config;
  return Math.floor(minSendDelayMs + Math.random() * (maxSendDelayMs - minSendDelayMs));
}
