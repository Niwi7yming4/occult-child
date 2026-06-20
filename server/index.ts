import { WebSocketServer } from 'ws';
import { createRoom, joinRoom, setReadyByWs, tryStartGame, handleDisconnect, getPlayerCount } from './roomManager.js';
import { ClientMessage } from './types.js';

const PORT = parseInt(process.env.WS_PORT || '3001', 10);

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`[WS] WebSocket server listening on port ${PORT}`);
  console.log(`[WS] Total rooms: 0`);
});

wss.on('connection', (ws) => {
  console.log('[WS] New client connected');

  ws.on('message', (raw) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      ws.send(JSON.stringify({ type: 'error', reason: '無效的訊息格式。' }));
      return;
    }

    switch (msg.type) {
      case 'create_room': {
        const { roomCode } = createRoom(msg.playerName, msg.characterId, ws);
        console.log(`[WS] Room created: ${roomCode}`);
        break;
      }

      case 'join_room': {
        const joined = joinRoom(msg.roomCode, msg.playerName, msg.characterId, ws);
        if (joined) {
          console.log(`[WS] ${msg.playerName} joined room ${msg.roomCode}`);
        }
        break;
      }

      case 'set_ready': {
        setReadyByWs(ws, msg.ready);
        break;
      }

      case 'start_game': {
        tryStartGame(ws);
        break;
      }

      default:
        ws.send(JSON.stringify({ type: 'error', reason: '未知的訊息類型。' }));
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
    console.log('[WS] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[WS] Client error:', err.message);
    handleDisconnect(ws);
  });
});

// Handle clean shutdown
process.on('SIGINT', () => {
  console.log('\n[WS] Shutting down...');
  wss.close(() => {
    console.log('[WS] Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[WS] Shutting down...');
  wss.close(() => {
    console.log('[WS] Server closed');
    process.exit(0);
  });
});