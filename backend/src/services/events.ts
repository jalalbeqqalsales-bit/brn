// Lightweight pub/sub used to push structured, non-log-line events (metric
// snapshots, lead updates, "interested" alerts) out over the WebSocket
// alongside the plain-text dispatch log.

import type { CampaignState } from "../types";

export type AppEvent =
  | { type: "metrics"; payload: CampaignState }
  | { type: "lead_update"; payload: { leadId: number; status: string } }
  | { type: "interested_alert"; payload: { leadId: number; domain: string; snippet: string } }
  | { type: "state_change"; payload: { status: string } };

type Listener = (event: AppEvent) => void;

const listeners = new Set<Listener>();

export function onAppEvent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitAppEvent(event: AppEvent): void {
  for (const listener of listeners) listener(event);
}
