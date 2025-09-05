// Client to Server Messages
export interface PlayerJoinMessage {
  type: 'playerJoin';
  playerId: string;
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
  };
}

export interface PlayerUpdateMessage {
  type: 'playerUpdate';
  data: {
    playerId?: string;
    playerCount: number;
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