import WebSocket from 'ws';
import { ClientToServerMessage, ServerToClientMessage } from '../types/messages';
import { Room } from './Room';

export class GameManager {
  private rooms = new Map<string, Room>();
  private wss: WebSocket.Server;
  private docs: Map<string, any>;

  constructor(wss: WebSocket.Server) {
    this.wss = wss;
    this.docs = require('y-websocket/bin/utils').docs;
  }

  private getRoom(roomId: string): Room {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    return this.rooms.get(roomId)!;
  }

  addConnection(roomId: string, ws: WebSocket) {
    const room = this.getRoom(roomId);
    room.addConnection(ws);
  }

  removeConnection(roomId: string, ws: WebSocket) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.removeConnection(ws);
    }
  }

  handleMessage(roomId: string, message: ClientToServerMessage, ws: WebSocket) {
    try {
      console.log(`[${roomId}] Received message:`, message);
      
      switch (message.type) {
        case 'gameStateChange':
          this.handleGameStateChange(roomId, message.data);
          break;
          
        case 'playerJoin':
          this.handlePlayerJoin(roomId, message.playerId);
          break;
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  private handlePlayerJoin(roomId: string, playerId: string) {
    const room = this.getRoom(roomId);
    room.addPlayer(playerId);
    
    console.log(`[${roomId}] Player joined: ${playerId}, total: ${room.players.size}/4`);
    
    room.broadcast({ 
      type: 'playerUpdate', 
      data: { playerId, playerCount: room.players.size } 
    });
    
    // Auto-start when 4 players join
    if (room.players.size === 4) {
      if (room.state.state !== 'countdown' && room.state.state !== 'playing') {
        this.startAutoGame(roomId);
      }
    }
  }

  private startAutoGame(roomId: string) {
    const topics = ['cat', 'house', 'tree', 'car', 'flower', 'sun', 'dog', 'bird'];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    console.log(`[${roomId}] Auto-starting game with topic: ${topic}`);
    
    this.handleGameStateChange(roomId, {
      topic,
      state: 'countdown',
      startTime: Date.now()
    });
  }

  private handleGameStateChange(roomId: string, data: any) {
    const room = this.getRoom(roomId);
    room.updateState(data);
    
    console.log(`[${roomId}] GameState updated:`, room.state);
    
    if (room.state.state === 'countdown') {
      this.startCountdown(roomId);
    }
    
    room.broadcast({ type: 'gameStateUpdate', data: room.state });
  }

  private startCountdown(roomId: string) {
    const room = this.getRoom(roomId);
    if (room.countdownTimer) return;
    
    let countdown = 3;
    room.updateState({ countdown });
    room.broadcast({ type: 'gameStateUpdate', data: { countdown } });
    
    room.countdownTimer = setInterval(() => {
      countdown--;
      room.updateState({ countdown });
      room.broadcast({ type: 'gameStateUpdate', data: { countdown } });
      
      if (countdown <= 0) {
        clearInterval(room.countdownTimer!);
        room.countdownTimer = undefined;
        this.startGameTimer(roomId);
      }
    }, 1000);
  }

  private startGameTimer(roomId: string) {
    const room = this.getRoom(roomId);
    let timeLeft = 30;
    
    room.updateState({ state: 'playing', timeLeft });
    room.broadcast({ type: 'gameStateUpdate', data: { state: 'playing', timeLeft } });
    
    room.gameTimer = setInterval(() => {
      timeLeft--;
      room.updateState({ timeLeft });
      room.broadcast({ type: 'gameStateUpdate', data: { timeLeft } });
      
      if (timeLeft <= 0) {
        clearInterval(room.gameTimer!);
        room.gameTimer = undefined;
        this.endGame(roomId);
      }
    }, 1000);
  }

  private endGame(roomId: string) {
    const room = this.getRoom(roomId);
    console.log(`[${roomId}] Game ended, reading drawing data...`);
    
    // Read Yjs drawing data
    const doc = this.docs.get(roomId);
    if (doc) {
      const drawingArray = doc.getArray('drawing');
      const drawingData = drawingArray.toArray();
      console.log(`[${roomId}] Drawing data:`, drawingData);
    }
    
    room.updateState({ state: 'ended' });
    
    // Send redirect message to clients
    room.broadcast({ 
      type: 'gameEnded', 
      data: { redirectTo: `/results?roomId=${roomId}` } 
    });
  }

  cleanup(roomId: string, playerId?: string | null) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    // Remove player from room if specified
    if (playerId) {
      room.removePlayer(playerId);
      console.log(`[${roomId}] Player ${playerId} left, remaining: ${room.players.size}`);
      
      // If room is empty, clean up everything
      if (room.isEmpty()) {
        console.log(`[${roomId}] Room is empty, cleaning up`);
        room.cleanup();
        this.rooms.delete(roomId);
      } else {
        // Broadcast updated player count
        room.broadcast({ 
          type: 'playerUpdate', 
          data: { playerCount: room.players.size } 
        });
      }
    }
  }
}