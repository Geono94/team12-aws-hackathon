import WebSocket from 'ws';
import { ClientToServerMessage } from '../types/messages';
import { Room } from './Room';
import { GAME_CONFIG } from './config';

export class GameManager {
  private rooms = new Map<string, Room>();
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
    
    console.log(`[${roomId}] Player joined: ${playerId}, total: ${room.players.size}/${GAME_CONFIG.MAX_PLAYERS}`);
    
    room.broadcast({ 
      type: 'playerUpdate', 
      data: { playerId, playerCount: room.players.size } 
    });
    
    // Auto-start when max players join
    if (room.players.size === GAME_CONFIG.MAX_PLAYERS) {
      if (room.state.state !== 'countdown' && room.state.state !== 'playing') {
        this.startAutoGame(roomId);
      }
    }
  }

  private startAutoGame(roomId: string) {
    const topics = ['cat', 'house', 'tree', 'car', 'flower', 'sun', 'dog', 'bird'];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    console.log(`[${roomId}] Auto-starting game with topic: ${topic}`);
    
    const room = this.getRoom(roomId);

    room.updateState({
      topic,
      state: 'countdown',
      startTime: Date.now()
    });
    
    room.startGame(this.docs);
  }

  private handleGameStateChange(roomId: string, data: any) {
    const room = this.getRoom(roomId);
    room.updateState(data);
    
    console.log(`[${roomId}] GameState updated:`, room.state);
    
    if (room.state.state === 'countdown') {
      room.startGame(this.docs);
    }
    
    room.broadcast({ type: 'gameStateUpdate', data: room.state });
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