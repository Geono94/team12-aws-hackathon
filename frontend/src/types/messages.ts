// Player Info Interface
export interface PlayerInfo {
  id: string;
  name: string;
  joinedAt: string;
}

// Client to Server Messages
export interface PlayerJoinMessage {
  type: 'playerJoin';
  playerInfo: PlayerInfo;
}

export interface GameStateChangeMessage {
  type: 'gameStateChange';
  data: {
    topic?: string;
    state?: 'waiting' | 'countdown' | 'playing' | 'ended';
    startTime?: number;
  };
}

export type ClientToServerMessage = 
  | PlayerJoinMessage
  | GameStateChangeMessage;

// Server to Client Messages
export interface GameStateUpdateMessage {
  type: 'gameStateUpdate';
  data: {
    state?: 'waiting' | 'countdown' | 'playing' | 'ended';
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
  | GameStateUpdateMessage
  | PlayerUpdateMessage
  | GameEndedMessage;

// Combined message types
export type NetworkMessage = ClientToServerMessage | ServerToClientMessage;