import { WebSocket } from 'ws';
import { PlayerInfo, ServerMessage } from './types.js';

interface Room {
  code: string;
  hostId: string;
  players: Map<string, PlayerConnection>;
  state: 'waiting' | 'playing';
}

interface PlayerConnection {
  ws: WebSocket;
  info: PlayerInfo;
}

const rooms = new Map<string, Room>();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function send(ws: WebSocket, message: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(room: Room, message: ServerMessage, excludeId?: string) {
  room.players.forEach((conn, id) => {
    if (id !== excludeId) {
      send(conn.ws, message);
    }
  });
}

export function createRoom(playerName: string, characterId: string, ws: WebSocket): { roomCode: string; playerId: string } {
  let code = generateCode();
  while (rooms.has(code)) {
    code = generateCode();
  }

  const playerId = crypto.randomUUID();
  const playerInfo: PlayerInfo = {
    id: playerId,
    name: playerName,
    characterId,
    ready: false,
    isHost: true,
  };

  const room: Room = {
    code,
    hostId: playerId,
    players: new Map([[playerId, { ws, info: playerInfo }]]),
    state: 'waiting',
  };

  rooms.set(code, room);
  console.log(`[Room] Created room ${code} by ${playerName}`);

  send(ws, { type: 'room_created', roomCode: code, playerId });
  return { roomCode: code, playerId };
}

export function joinRoom(code: string, playerName: string, characterId: string, ws: WebSocket): boolean {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    send(ws, { type: 'join_error', reason: '房間不存在或已關閉。' });
    return false;
  }
  if (room.state !== 'waiting') {
    send(ws, { type: 'join_error', reason: '遊戲已開始，無法加入。' });
    return false;
  }
  if (room.players.size >= 4) {
    send(ws, { type: 'join_error', reason: '房間已滿（最多 4 人）。' });
    return false;
  }

  const playerId = crypto.randomUUID();
  const playerInfo: PlayerInfo = {
    id: playerId,
    name: playerName,
    characterId,
    ready: false,
    isHost: false,
  };

  room.players.set(playerId, { ws, info: playerInfo });

  // Send current state to the new player
  const players: PlayerInfo[] = [];
  room.players.forEach(p => players.push(p.info));
  send(ws, { type: 'joined_room', roomCode: code, playerId, players });

  // Notify others
  broadcast(room, { type: 'player_joined', player: playerInfo }, playerId);

  console.log(`[Room] ${playerName} joined room ${code} (${room.players.size}/4)`);
  return true;
}

export function setReadyByWs(ws: WebSocket, ready: boolean): string | null {
  for (const [, room] of rooms) {
    for (const [id, conn] of room.players) {
      if (conn.ws === ws) {
        conn.info.ready = ready;
        broadcast(room, { type: 'player_ready', playerId: id, ready });
        return room.code;
      }
    }
  }
  return null;
}

export function tryStartGame(ws: WebSocket): string | null {
  for (const [code, room] of rooms) {
    if (room.hostId !== getPlayerIdByWs(room, ws)) continue;
    if (room.players.size < 2) return null;
    // Check all ready
    let allReady = true;
    room.players.forEach(conn => { if (!conn.info.ready) allReady = false; });
    if (!allReady) return null;

    room.state = 'playing';
    broadcast(room, { type: 'start_game' });
    return code;
  }
  return null;
}

function getPlayerIdByWs(room: Room, ws: WebSocket): string | null {
  for (const [id, conn] of room.players) {
    if (conn.ws === ws) return id;
  }
  return null;
}

export function handleDisconnect(ws: WebSocket) {
  for (const [code, room] of rooms) {
    let disconnectedId: string | null = null;
    for (const [id, conn] of room.players) {
      if (conn.ws === ws) {
        disconnectedId = id;
        break;
      }
    }

    if (disconnectedId) {
      room.players.delete(disconnectedId);

      if (room.players.size === 0) {
        rooms.delete(code);
        console.log(`[Room] Closed room ${code} (all players left)`);
        return;
      }

      // If host left, promote next player
      if (room.hostId === disconnectedId) {
        const nextHost = room.players.entries().next().value;
        if (nextHost) {
          room.hostId = nextHost[0];
          nextHost[1].info.isHost = true;
          broadcast(room, { type: 'player_ready', playerId: nextHost[0], ready: nextHost[1].info.ready });
        }
      }

      broadcast(room, { type: 'player_left', playerId: disconnectedId });
      console.log(`[Room] Player left room ${code} (${room.players.size}/4)`);
      return;
    }
  }
}

export function getPlayerCount(): number {
  let count = 0;
  rooms.forEach(r => count += r.players.size);
  return count;
}