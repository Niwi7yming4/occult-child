import { ClientMessage, ServerMessage } from './types';

type MessageHandler = (msg: ServerMessage) => void;

const RECONNECT_DELAY = 3000;

// In dev, connect directly to WS port. In production, connect via same origin.
const WS_URL = import.meta.env.DEV
  ? `ws://${window.location.hostname}:3001`
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

class MultiplayerSocket {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private reconnectTimer: number | null = null;
  private connected = false;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(WS_URL);
    } catch {
      console.warn('[MP] Failed to create WebSocket, retrying...');
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[MP] Connected');
      this.connected = true;
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);
        this.dispatch(msg);
      } catch {
        console.warn('[MP] Invalid message:', event.data);
      }
    };

    this.ws.onclose = () => {
      console.log('[MP] Disconnected');
      this.connected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      console.warn('[MP] Error');
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      console.warn('[MP] Cannot send — not connected');
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  isConnected() {
    return this.connected;
  }

  private dispatch(msg: ServerMessage) {
    const typeHandlers = this.handlers.get(msg.type);
    if (typeHandlers) {
      typeHandlers.forEach(fn => fn(msg));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_DELAY);
  }
}

export const socket = new MultiplayerSocket();