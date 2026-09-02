import path from "node:path";
import http from "node:http";
import express from "express";
import { config } from "./config";
import { apiRouter } from "./routes/api";
import { attachWebSocketServer } from "./websocket";
import { resumeLoopsIfNeeded } from "./controller/masterController";
import { logger } from "./services/logger";

export function createServer(): http.Server {
  const app = express();
  app.use(express.json());

  app.use("/api", apiRouter);
  app.use(express.static(path.resolve(__dirname, "../../frontend")));

  const httpServer = http.createServer(app);
  attachWebSocketServer(httpServer);

  return httpServer;
}

export function start(): void {
  const server = createServer();
  server.listen(config.port, () => {
    logger.success("server", `Voniweb engine dashboard running at http://localhost:${config.port}`);
    if (config.smtpAccounts.length === 0) {
      logger.warn("server", "No SMTP accounts configured yet - add SMTP_1_* vars to .env before starting a campaign.");
    }
    if (!config.anthropicApiKey) {
      logger.warn("server", "ANTHROPIC_API_KEY is not set - auditing/copywriting/triage will fail until it is.");
    }
    resumeLoopsIfNeeded();
  });
}
