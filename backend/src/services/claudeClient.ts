import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";
import type { AuditFlaws, ReplyClassification } from "../types";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!config.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to your .env file.");
  }
  if (!client) client = new Anthropic({ apiKey: config.anthropicApiKey });
  return client;
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function extractJson<T>(text: string): T {
  // Claude sometimes wraps JSON in a fenced code block despite instructions not to.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error(`No JSON object found in Claude response: ${text}`);
  return JSON.parse(raw.slice(start, end + 1)) as T;
}

/**
 * Turns raw scrape signals (SSL status, viewport meta, load time, DOM heuristics)
 * into a short, prioritized list of prospect-facing flaws a cold email can reference.
 */
export async function summarizeAuditFlaws(input: {
  domain: string;
  hasSSL: boolean;
  mobileResponsive: boolean;
  loadTimeMs: number | null;
  outdatedUISignals: string[];
  pageTitle: string | null;
}): Promise<AuditFlaws> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: config.anthropicModel,
    max_tokens: 600,
    system:
      "You are a website conversion auditor for a web development agency. " +
      "Given raw technical signals about a prospect's website, identify the most " +
      "commercially compelling flaws (things that cost them leads or trust) and phrase " +
      "each as a short, specific, non-generic observation a human would notice. " +
      "Respond with ONLY a JSON object, no prose, no markdown fences.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          domain: input.domain,
          pageTitle: input.pageTitle,
          hasSSL: input.hasSSL,
          mobileResponsive: input.mobileResponsive,
          loadTimeMs: input.loadTimeMs,
          outdatedUISignals: input.outdatedUISignals,
          instructions:
            "Return JSON: { \"flaws\": string[] (max 4, most impactful first), \"notes\": string (2-3 sentence internal summary) }",
        }),
      },
    ],
  });

  const text = extractText(message);
  const parsed = extractJson<{ flaws: string[]; notes: string }>(text);

  return {
    flaws: parsed.flaws?.slice(0, 4) ?? [],
    notes: parsed.notes ?? "",
    hasSSL: input.hasSSL,
    mobileResponsive: input.mobileResponsive,
    loadTimeMs: input.loadTimeMs,
    outdatedUI: input.outdatedUISignals.length > 0,
  };
}

/**
 * Writes a hyper-personalized Problem-Agitate-Solve cold email referencing the
 * specific audit flaws found on the prospect's site.
 */
export async function writeColdEmail(input: {
  domain: string;
  niche: string | null;
  contactName: string | null;
  flaws: string[];
}): Promise<{ subject: string; body: string }> {
  const anthropic = getClient();
  const greetingName = input.contactName?.trim() || "there";

  const message = await anthropic.messages.create({
    model: config.anthropicModel,
    max_tokens: 500,
    system:
      `You are ${config.senderName}, ${config.senderTitle} at ${config.agencyName}, a web ` +
      `development and lead-generation agency based in ${config.agencyLocation}. You write short, ` +
      "specific, human-sounding cold emails using the Problem-Agitate-Solve structure. " +
      "Rules: reference ONE or TWO of the specific flaws provided, never invent flaws not given. " +
      "Keep it under 120 words. No generic marketing fluff, no exclamation-mark energy, no emoji. " +
      "End with a soft, low-friction call to action for a 15-minute demo call. " +
      "Sign off with the sender's first name only. " +
      "Respond with ONLY a JSON object, no prose, no markdown fences.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          prospectDomain: input.domain,
          prospectNiche: input.niche,
          contactName: greetingName,
          specificFlaws: input.flaws,
          bookingLink: config.bookingLink || null,
          instructions:
            'Return JSON: { "subject": string (under 60 chars, specific, not clickbait), "body": string (plain text email, use \\n for line breaks) }',
        }),
      },
    ],
  });

  const text = extractText(message);
  const parsed = extractJson<{ subject: string; body: string }>(text);
  return { subject: parsed.subject.trim(), body: parsed.body.trim() };
}

/**
 * Classifies an inbound reply into INTERESTED / NOT_INTERESTED / QUESTION.
 */
export async function classifyReply(input: {
  originalEmailBody: string;
  replyBody: string;
}): Promise<{ classification: ReplyClassification; reasoning: string }> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: config.anthropicModel,
    max_tokens: 200,
    system:
      "You triage replies to cold sales emails. Classify the reply as exactly one of: " +
      "INTERESTED (wants to talk, asks to book a call, positive engagement), " +
      "NOT_INTERESTED (declines, unsubscribes, unrelated auto-reply, hostile), or " +
      "QUESTION (asks for more info before deciding, neither a clear yes nor no). " +
      "Respond with ONLY a JSON object, no prose, no markdown fences.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          originalEmailSent: input.originalEmailBody,
          prospectReply: input.replyBody,
          instructions: 'Return JSON: { "classification": "INTERESTED"|"NOT_INTERESTED"|"QUESTION", "reasoning": string }',
        }),
      },
    ],
  });

  const text = extractText(message);
  const parsed = extractJson<{ classification: ReplyClassification; reasoning: string }>(text);
  return parsed;
}
