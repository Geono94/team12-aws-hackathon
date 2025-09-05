import WebSocket from 'ws';
import { GAME_CONFIG } from './config';

export interface PlayerInfo {
  id: string;
  name: string;
  joinedAt: string;
}

export class Room {
  public id: string;
  public state: any = {};
  public players = new Map<string, PlayerInfo>();
  public connections = new Set<WebSocket>();
  public gameTimer?: NodeJS.Timeout;
  public countdownTimer?: NodeJS.Timeout;

  constructor(id: string) {
    this.id = id;
  }

  addPlayer(playerInfo: PlayerInfo) {
    this.players.set(playerInfo.id, playerInfo);
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  getPlayersArray(): PlayerInfo[] {
    return Array.from(this.players.values());
  }

  addConnection(ws: WebSocket) {
    this.connections.add(ws);
  }

  removeConnection(ws: WebSocket) {
    this.connections.delete(ws);
  }

  updateState(newState: any) {
    this.state = { ...this.state, ...newState };
  }

  broadcast(message: any, sender?: WebSocket) {
    this.connections.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ ...message, roomId: this.id }));
      }
    });
  }

  cleanup() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = undefined;
    }
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
    
    this.connections.clear();
    this.players.clear();
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  startCountdown(onComplete: () => void) {
    if (this.countdownTimer) return;
    
    let countdown = GAME_CONFIG.COUNTDOWN_TIME;
    this.updateState({ countdown });
    this.broadcast({ type: 'gameStateUpdate', data: { countdown } });
    
    this.countdownTimer = setInterval(() => {
      countdown--;
      this.updateState({ countdown });
      this.broadcast({ type: 'gameStateUpdate', data: { countdown } });
      
      if (countdown <= 0) {
        clearInterval(this.countdownTimer!);
        this.countdownTimer = undefined;
        onComplete();
      }
    }, 1000);
  }

  startGameTimer(onComplete: () => void) {
    let timeLeft = GAME_CONFIG.GAME_TIME;
    
    this.updateState({ state: 'playing', timeLeft });
    this.broadcast({ type: 'gameStateUpdate', data: { state: 'playing', timeLeft } });
    
    this.gameTimer = setInterval(() => {
      timeLeft--;
      this.updateState({ timeLeft });
      this.broadcast({ type: 'gameStateUpdate', data: { timeLeft } });
      
      if (timeLeft <= 0) {
        clearInterval(this.gameTimer!);
        this.gameTimer = undefined;
        onComplete();
      }
    }, 1000);
  }

  startGame(docs: Map<string, any>) {
    this.startCountdown(() => {
      this.startGameTimer(() => {
        this.endGame(docs);
      });
    });
  }

  private async endGame(docs: Map<string, any>) {
    console.log(`[${this.id}] Game ended, reading drawing data...`);
    
    const doc = docs.get(this.id);
    if (doc) {
      const drawingArray = doc.getArray('drawing');
      const drawingData = drawingArray.toArray();
      console.log(`[${this.id}] Drawing data:`, drawingData);
    }
    
    this.updateState({ state: 'ended' });
    
    // Update room status in database
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://77q0bmlyb4.execute-api.us-east-1.amazonaws.com/prod';
      const response = await fetch(`${API_BASE_URL}/rooms/${this.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'finished' }),
      });
      
      if (response.ok) {
        console.log(`[${this.id}] Room status updated to finished`);
      } else {
        console.error(`[${this.id}] Failed to update room status: ${response.status}`);
      }
    } catch (error) {
      console.error(`[${this.id}] Failed to update room status:`, error);
    }
    
    this.broadcast({ 
      type: 'gameEnded', 
      data: { redirectTo: `/results?roomId=${this.id}` } 
    });
  }
}