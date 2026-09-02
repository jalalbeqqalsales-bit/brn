-- Voniweb Cold Email Engine - SQLite schema

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL UNIQUE,
  niche TEXT,
  contact_name TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'DISCOVERED',
    -- DISCOVERED -> NEW (validated, queued) | AUDIT_FAILED (invalid domain)
    -- NEW -> AUDITING -> AUDITED -> AUDIT_FAILED
    -- AUDITED -> DRAFTING -> READY_TO_SEND -> SENDING -> EMAILED -> SEND_FAILED
    -- EMAILED -> REPLIED
    -- REPLIED -> INTERESTED | NOT_INTERESTED | QUESTION
    -- INTERESTED -> MEETING_BOOKED
  draft_subject TEXT,
  draft_body TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  has_ssl INTEGER,
  mobile_responsive INTEGER,
  load_time_ms INTEGER,
  outdated_ui INTEGER,
  flaws_json TEXT,
  raw_notes TEXT,
  screenshot_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audits_lead ON audits(lead_id);

CREATE TABLE IF NOT EXISTS emails_sent (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  smtp_account TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  message_id TEXT,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_emails_lead ON emails_sent(lead_id);

CREATE TABLE IF NOT EXISTS replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  email_id INTEGER REFERENCES emails_sent(id) ON DELETE SET NULL,
  smtp_account TEXT NOT NULL,
  from_address TEXT,
  subject TEXT,
  body TEXT,
  classification TEXT, -- INTERESTED | NOT_INTERESTED | QUESTION
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_replies_lead ON replies(lead_id);

CREATE TABLE IF NOT EXISTS smtp_usage (
  smtp_account TEXT NOT NULL,
  usage_date TEXT NOT NULL, -- YYYY-MM-DD
  sent_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (smtp_account, usage_date)
);

CREATE TABLE IF NOT EXISTS campaign_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  status TEXT NOT NULL DEFAULT 'STOPPED', -- RUNNING | PAUSED | STOPPED
  usage_date TEXT NOT NULL DEFAULT (date('now')),
  emails_sent_today INTEGER NOT NULL DEFAULT 0,
  audits_completed_today INTEGER NOT NULL DEFAULT 0,
  replies_received_today INTEGER NOT NULL DEFAULT 0,
  meetings_booked_today INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO campaign_state (id, status) VALUES (1, 'STOPPED');

CREATE TABLE IF NOT EXISTS dispatch_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL DEFAULT 'info', -- info | success | warn | error
  worker TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dispatch_log_created ON dispatch_log(created_at);
