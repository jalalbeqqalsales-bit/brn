import { config } from "../config";
import { getCampaignState } from "../db/db";

export function dailyTargetReached(): boolean {
  return getCampaignState().emails_sent_today >= config.dailyEmailTarget;
}

/**
 * Sleeps for `ms` but wakes early (returning) whenever `shouldAbort()` starts
 * returning true, so a PAUSE/STOP click takes effect within ~250ms instead of
 * waiting out a full multi-second send delay.
 */
export async function interruptibleSleep(ms: number, shouldAbort: () => boolean): Promise<void> {
  const step = 250;
  let waited = 0;
  while (waited < ms) {
    if (shouldAbort()) return;
    const chunk = Math.min(step, ms - waited);
    await new Promise((resolve) => setTimeout(resolve, chunk));
    waited += chunk;
  }
}
