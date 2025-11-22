import { ipcMain, WebContents } from "electron";
import WebSocket from "ws";

import { URL } from "../apiClient";

let subscribers: WebContents[] = [];
let ws: WebSocket | null = null;
let currentStatus: "online" | "instavel" | "offline" = "offline"; // inicializa offline
let reconnectTimeout: NodeJS.Timeout | null = null;

export function statusIPC() {
  ipcMain.on("subscribe-service-status", (event) => {
    const wc = event.sender;
    if (!subscribers.includes(wc)) subscribers.push(wc);

    wc.once("destroyed", () => {
      subscribers = subscribers.filter(s => s !== wc);
    });

    // envia status atual imediatamente
    wc.send("service-status:update", currentStatus);
  });

  if (!ws) setupWebSocket();
}

export function setupWebSocket() {
  ws = new WebSocket(`ws://${URL}/ws/status`);

  ws.on("open", () => {
    console.log("WS status conectado");
    updateStatus("online");
  });

  ws.on("close", () => {
    console.log("WS status desconectado. Tentando reconectar em 5s...");
    updateStatus("offline");
    scheduleReconnect();
  });

  ws.on("error", (err) => {
    console.error("Erro WS:", err.message);
    updateStatus("offline");
    ws?.close();
  });

  ws.on("message", (msg) => {
    try {
      const { status } = JSON.parse(msg.toString());
      updateStatus(status);
    } catch (err) {
      console.error("Erro ao processar WS status:", err);
    }
  });
}

function updateStatus(status: typeof currentStatus) {
  if (status === currentStatus) return; // só envia se mudou
  currentStatus = status;
  subscribers.forEach(wc => wc.send("service-status:update", status));
}

function scheduleReconnect() {
  if (reconnectTimeout) return; // evita múltiplos timers
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    setupWebSocket();
  }, 5000);
}
