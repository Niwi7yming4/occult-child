// Mirrored client-side types for multiplayer
// These mirror server/types.ts for the client bundle

export type MessageType =
  | 'create_room'
  | 'room_created'
  | 'join_room'
  | 'joined_room'
  | 'join_error'
  | 'player_joined'
  | 'player_left'
  | 'set_ready'
  | 'player_ready'
  | 'start_game'
  | 'error';

export interface BaseMessage {
  type: MessageType;
}

export interface CreateRoomMessage extends BaseMessage {
  type: 'create_room';
  playerName: string;
  characterId: string;
}

export interface JoinRoomMessage extends BaseMessage {
  type: 'join_room';
  roomCode: string;
  playerName: string;
  characterId: string;
}

export interface SetReadyMessage extends BaseMessage {
  type: 'set_ready';
  ready: boolean;
}

export interface StartGameMessage extends BaseMessage {
  type: 'start_game';
}

export interface RoomCreatedMessage extends BaseMessage {
  type: 'room_created';
  roomCode: string;
  playerId: string;
}

export interface JoinedRoomMessage extends BaseMessage {
  type: 'joined_room';
  roomCode: string;
  playerId: string;
  players: PlayerInfo[];
}

export interface JoinErrorMessage extends BaseMessage {
  type: 'join_error';
  reason: string;
}

export interface PlayerJoinedMessage extends BaseMessage {
  type: 'player_joined';
  player: PlayerInfo;
}

export interface PlayerLeftMessage extends BaseMessage {
  type: 'player_left';
  playerId: string;
}

export interface PlayerReadyMessage extends BaseMessage {
  type: 'player_ready';
  playerId: string;
  ready: boolean;
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  reason: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  characterId: string;
  ready: boolean;
  isHost: boolean;
}

export type ClientMessage = CreateRoomMessage | JoinRoomMessage | SetReadyMessage | StartGameMessage;
export type ServerMessage =
  | RoomCreatedMessage
  | JoinedRoomMessage
  | JoinErrorMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | PlayerReadyMessage
  | StartGameMessage
  | ErrorMessage;