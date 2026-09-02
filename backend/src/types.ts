export type CampaignStatus = "RUNNING" | "PAUSED" | "STOPPED";

export type LeadStatus =
  | "DISCOVERED"
  | "NEW"
  | "AUDITING"
  | "AUDITED"
  | "AUDIT_FAILED"
  | "DRAFTING"
  | "READY_TO_SEND"
  | "SENDING"
  | "EMAILED"
  | "SEND_FAILED"
  | "REPLIED"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "QUESTION"
  | "MEETING_BOOKED";

export type ReplyClassification = "INTERESTED" | "NOT_INTERESTED" | "QUESTION";

export interface Lead {
  id: number;
  domain: string;
  niche: string | null;
  contact_name: string | null;
  contact_email: string | null;
  status: LeadStatus;
  draft_subject: string | null;
  draft_body: string | null;
  created_at: string;
  updated_at: string;
}

export interface Audit {
  id: number;
  lead_id: number;
  has_ssl: 0 | 1 | null;
  mobile_responsive: 0 | 1 | null;
  load_time_ms: number | null;
  outdated_ui: 0 | 1 | null;
  flaws_json: string | null;
  raw_notes: string | null;
  screenshot_path: string | null;
  created_at: string;
}

export interface AuditFlaws {
  flaws: string[];
  hasSSL: boolean;
  mobileResponsive: boolean;
  loadTimeMs: number | null;
  outdatedUI: boolean;
  notes: string;
}

export interface EmailSent {
  id: number;
  lead_id: number;
  smtp_account: string;
  from_email: string;
  to_email: string;
  subject: string;
  body: string;
  message_id: string | null;
  sent_at: string;
}

export interface Reply {
  id: number;
  lead_id: number;
  email_id: number | null;
  smtp_account: string;
  from_address: string | null;
  subject: string | null;
  body: string | null;
  classification: ReplyClassification | null;
  received_at: string;
}

export interface CampaignState {
  id: 1;
  status: CampaignStatus;
  usage_date: string;
  emails_sent_today: number;
  audits_completed_today: number;
  replies_received_today: number;
  meetings_booked_today: number;
  updated_at: string;
}

export interface DispatchLogEntry {
  id: number;
  level: "info" | "success" | "warn" | "error";
  worker: string;
  message: string;
  created_at: string;
}

export interface SmtpAccountConfig {
  key: string; // e.g. "SMTP_1"
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  imapHost?: string;
  imapPort?: number;
}
