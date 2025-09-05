// API Request/Response types
export interface AIGenerateRequest {
  gameId: string;
  imageData: string;
  style?: string;
}

export interface AIGenerateResponse {
  success: boolean;
  aiImageUrl?: string;
  originalImageUrl?: string;
  error?: string;
}

export interface GameJoinRequest {
  roomId: string;
  playerId: string;
  playerName?: string;
}

export interface GameJoinResponse {
  success: boolean;
  gameState?: any;
  error?: string;
}

export interface WebSocketMessage {
  type: 'join' | 'leave' | 'draw' | 'gameState' | 'error';
  data?: any;
  roomId?: string;
  playerId?: string;
}

export interface APIError {
  message: string;
  code?: string;
  details?: any;
}