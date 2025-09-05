import { GameStateType } from "./game";

// Player Info Interface
export interface PlayerInfo {
  id: string;
  name: string;
  joinedAt: string;
}

/**
 * 방을 찾고, 없으면 만들고, 있으면 들어갑니다
 */
export interface SearchRoomMessage {
  type: 'searchRoom';
  data: {
    playerId: string;
    playerName: string;
  };
}

/**
 * 이미 있던 방에 들어갑니다
 */
export interface JoinRoomMessage {
  type: 'joinRoom';
  data: {
    roomId: string;
    playerId: string;
    playerName: string;
  };
}


export type ClientToServerMessage = 
  | SearchRoomMessage | JoinRoomMessage;

// Server to Client Messages
export interface RoomJoinedMessage {
  type: 'roomJoined';
  data: {
    roomId: string;
    playerCount: number;
    maxPlayers: number;
    players: PlayerInfo[];
  };
}

export interface GameStateUpdateMessage {
  type: 'gameStateUpdate';
  data: {
    state?: GameStateType;
    topic?: string;
    countdown?: number;
    timeLeft?: number;
    players?: PlayerInfo[];
  };
}

export interface PlayerUpdateMessage {
  type: 'playerUpdate';
  data: {
    playerInfo?: PlayerInfo;
    playerCount: number;
    players?: PlayerInfo[];
  };
}

export interface KickRoomMessage {
  type: 'kickRoom';
}

export interface GameEndedMessage {
  type: 'gameEnded';
  data: {
    redirectTo: string;
  };
}

export type ServerToClientMessage = 
  | RoomJoinedMessage
  | GameStateUpdateMessage
  | PlayerUpdateMessage
  | GameEndedMessage | KickRoomMessage;

// Combined message types
export type NetworkMessage = ClientToServerMessage | ServerToClientMessage;