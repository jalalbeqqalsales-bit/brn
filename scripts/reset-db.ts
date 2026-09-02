/**
 * Wipes all campaign data (leads, audits, emails, replies, logs) while
 * keeping the schema. Useful when testing the pipeline from a clean slate.
 * Usage: npm run reset-db
 */
import { db } from "../backend/src/db/db";

const tables = ["dispatch_log", "replies", "emails_sent", "smtp_usage", "audits", "leads"];

const resetAll = db.transaction(() => {
  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }
  db.prepare(
    `UPDATE campaign_state SET status = 'STOPPED', emails_sent_today = 0, audits_completed_today = 0,
     replies_received_today = 0, meetings_booked_today = 0, updated_at = datetime('now') WHERE id = 1`
  ).run();
});

resetAll();
console.log("Database reset: all leads, audits, emails, replies, and logs cleared.");
