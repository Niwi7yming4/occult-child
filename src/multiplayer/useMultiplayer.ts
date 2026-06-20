import { useState, useEffect, useCallback } from 'react';
import { socket } from './socket';
import { PlayerInfo, ServerMessage } from './types';

interface MultiplayerState {
  connected: boolean;
  inRoom: boolean;
  isHost: boolean;
  roomCode: string | null;
  playerId: string | null;
  players: PlayerInfo[];
  error: string | null;
}

export function useMultiplayer() {
  const [state, setState] = useState<MultiplayerState>({
    connected: false,
    inRoom: false,
    isHost: false,
    roomCode: null,
    playerId: null,
    players: [],
    error: null,
  });

  useEffect(() => {
    socket.connect();

    const unsubs = [
      socket.on('room_created', (msg) => {
        setState(s => ({
          ...s,
          inRoom: true,
          isHost: true,
          roomCode: (msg as any).roomCode,
          playerId: (msg as any).playerId,
          players: [{
            id: (msg as any).playerId,
            name: '',
            characterId: '',
            ready: false,
            isHost: true,
          }],
          error: null,
        }));
      }),

      socket.on('joined_room', (msg) => {
        const data = msg as any;
        setState(s => ({
          ...s,
          inRoom: true,
          isHost: false,
          roomCode: data.roomCode,
          playerId: data.playerId,
          players: data.players,
          error: null,
        }));
      }),

      socket.on('join_error', (msg) => {
        setState(s => ({ ...s, error: (msg as any).reason }));
      }),

      socket.on('player_joined', (msg) => {
        const data = msg as any;
        setState(s => ({ ...s, players: [...s.players, data.player] }));
      }),

      socket.on('player_left', (msg) => {
        const data = msg as any;
        setState(s => ({
          ...s,
          players: s.players.filter(p => p.id !== data.playerId),
        }));
      }),

      socket.on('player_ready', (msg) => {
        const data = msg as any;
        setState(s => ({
          ...s,
          players: s.players.map(p =>
            p.id === data.playerId ? { ...p, ready: data.ready } : p
          ),
        }));
      }),

      socket.on('start_game', () => {
        setState(s => ({ ...s, inRoom: false }));
      }),

      socket.on('error', (msg) => {
        setState(s => ({ ...s, error: (msg as any).reason }));
      }),
    ];

    const interval = setInterval(() => {
      setState(s => ({ ...s, connected: socket.isConnected() }));
    }, 1000);

    return () => {
      unsubs.forEach(fn => fn());
      clearInterval(interval);
    };
  }, []);

  const createRoom = useCallback((playerName: string, characterId: string) => {
    socket.send({ type: 'create_room', playerName, characterId });
  }, []);

  const joinRoom = useCallback((roomCode: string, playerName: string, characterId: string) => {
    socket.send({ type: 'join_room', roomCode, playerName, characterId });
  }, []);

  const setReady = useCallback((ready: boolean) => {
    socket.send({ type: 'set_ready', ready });
  }, []);

  const startGame = useCallback(() => {
    socket.send({ type: 'start_game' });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.disconnect();
    setState({
      connected: false,
      inRoom: false,
      isHost: false,
      roomCode: null,
      playerId: null,
      players: [],
      error: null,
    });
  }, []);

  return { ...state, createRoom, joinRoom, setReady, startGame, leaveRoom };
}