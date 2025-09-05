import { GameStateType } from "./game";

// Player Info Interface
export interface PlayerInfo {
  id: string;
  name: string;
  joinedAt: string;
}

// Client to Server Messages
export interface JoinRoomMessage {
  type: 'joinRoom';
  data: {
    playerId: string;
    playerName: string;
  };
}

export interface PlayerJoinMessage {
  type: 'playerJoin';
  playerInfo: PlayerInfo;
}
 

export type ClientToServerMessage = 
  | JoinRoomMessage
  | PlayerJoinMessage

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
  | GameEndedMessage;

// Combined message types
export type NetworkMessage = ClientToServerMessage | ServerToClientMessage;