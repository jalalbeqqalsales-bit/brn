import { findLeadsByStatus, updateLeadStatus } from "../db/db";
import { logger } from "../services/logger";
import { emitAppEvent } from "../services/events";
import type { Lead } from "../types";

const WORKER = "discovery";

// Reasonably strict but permissive domain check (no protocol/path, just host).
const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/**
 * Validates freshly-added leads (from manual entry or bulk import) before
 * they enter the audit queue: rejects malformed domains and normalizes
 * niche/domain casing.
 */
export function validateLead(lead: Lead): void {
  const cleanDomain = lead.domain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

  if (!DOMAIN_RE.test(cleanDomain)) {
    updateLeadStatus(lead.id, "AUDIT_FAILED");
    emitAppEvent({ type: "lead_update", payload: { leadId: lead.id, status: "AUDIT_FAILED" } });
    logger.warn(WORKER, `Rejected invalid domain "${lead.domain}".`);
    return;
  }

  updateLeadStatus(lead.id, "NEW");
  emitAppEvent({ type: "lead_update", payload: { leadId: lead.id, status: "NEW" } });
  logger.info(WORKER, `Queued ${cleanDomain}${lead.niche ? ` (${lead.niche})` : ""} for audit.`);
}

export async function runDiscoveryTick(batchSize = 5): Promise<number> {
  const leads = findLeadsByStatus("DISCOVERED", batchSize);
  for (const lead of leads) {
    validateLead(lead);
  }
  return leads.length;
}
