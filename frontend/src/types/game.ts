export interface Player {
  id: string;
  name?: string;
  color: string;
  isReady: boolean;
}

export interface GameState {
  id: string;
  state: 'waiting' | 'countdown' | 'playing' | 'ended';
  topic: string | null;
  startTime: number | null;
  players: string[];
  countdown?: number;
  timeLeft?: number;
}

export interface GameRoom {
  id: string;
  players: Player[];
  state: 'waiting' | 'countdown' | 'drawing' | 'processing' | 'results';
  topic?: string;
  startTime?: number;
  canvasData?: string;
  aiResult?: string;
}

export interface DrawPoint {
  x: number;
  y: number;
  color: string;
  size: number;
}

export interface DrawingEvent {
  type: 'draw' | 'erase';
  x: number;
  y: number;
  color?: string;
  size?: number;
  playerId: string;
}

export interface GameMessage {
  action: 'joinGame' | 'startGame' | 'endGame' | 'draw';
  gameId?: string;
  playerId?: string;
  data?: any;
}

export type GameStateType = 'waiting' | 'countdown' | 'playing' | 'ended';
export type RoomStateType = 'waiting' | 'countdown' | 'drawing' | 'processing' | 'results';
