import type { Server as HttpServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { onLogEntry } from "./services/logger";
import { onAppEvent } from "./services/events";
import { getRecentLogs, getCampaignState } from "./db/db";

export function attachWebSocketServer(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  function broadcast(message: unknown): void {
    const data = JSON.stringify(message);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(data);
    }
  }

  onLogEntry((entry) => broadcast({ type: "log", payload: entry }));
  onAppEvent((event) => broadcast(event));

  wss.on("connection", (socket) => {
    // Prime new clients with recent history + current metrics so the UI
    // doesn't render empty until the next live event.
    socket.send(JSON.stringify({ type: "log_backfill", payload: getRecentLogs(100) }));
    socket.send(JSON.stringify({ type: "metrics", payload: getCampaignState() }));
  });

  return wss;
}
