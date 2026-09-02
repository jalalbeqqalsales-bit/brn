/**
 * CLI helper to bulk import leads from a CSV file without going through the UI.
 * Usage: npm run import-leads -- path/to/leads.csv
 * CSV format (header optional): domain,niche,contact_name,contact_email
 */
import fs from "node:fs";
import path from "node:path";
import { insertLead } from "../backend/src/db/db";

function parseCsvLine(line: string): string[] {
  return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

function main(): void {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npm run import-leads -- path/to/leads.csv");
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), filePath);
  const content = fs.readFileSync(resolved, "utf-8");
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let created = 0;
  let skipped = 0;

  for (const line of lines) {
    const [domain, niche, contact_name, contact_email] = parseCsvLine(line);
    if (!domain || domain.toLowerCase() === "domain") continue; // skip header row

    const lead = insertLead({
      domain,
      niche: niche || null,
      contact_name: contact_name || null,
      contact_email: contact_email || null,
    });
    if (lead) created++;
    else skipped++;
  }

  console.log(`Imported ${created} lead(s), skipped ${skipped} duplicate(s)/invalid row(s).`);
}

main();
