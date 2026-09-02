import { insertLogEntry, trimDispatchLog } from "../db/db";
import type { DispatchLogEntry } from "../types";

type Listener = (entry: DispatchLogEntry) => void;

const listeners = new Set<Listener>();
let logCount = 0;

export function onLogEntry(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function log(
  worker: string,
  message: string,
  level: DispatchLogEntry["level"] = "info"
): DispatchLogEntry {
  const entry = insertLogEntry({ level, worker, message });
  for (const listener of listeners) listener(entry);

  logCount++;
  if (logCount % 500 === 0) trimDispatchLog();

  return entry;
}

export const logger = {
  info: (worker: string, message: string) => log(worker, message, "info"),
  success: (worker: string, message: string) => log(worker, message, "success"),
  warn: (worker: string, message: string) => log(worker, message, "warn"),
  error: (worker: string, message: string) => log(worker, message, "error"),
};
