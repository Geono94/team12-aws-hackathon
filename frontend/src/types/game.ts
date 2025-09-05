export interface Player {
  id: string;
  name?: string;
  color: string;
  isReady: boolean;
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
