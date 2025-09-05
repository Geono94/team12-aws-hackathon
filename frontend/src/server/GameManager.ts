import WebSocket from 'ws';
import { ClientToServerMessage, JoinRoomMessage } from '../types/messages';
import { PlayerInfo, Room } from './Room';
import { GAME_CONFIG } from './config';

export class GameManager {
  private rooms = new Map<string, Room>();
  private docs: Map<string, any>;

  constructor() {
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

  private async handleJoinRoom(ws: WebSocket, message: JoinRoomMessage) {
    const { playerId, playerName } = message.data;
    
    if (!playerId || !playerName) {
      ws.send(JSON.stringify({
        type: 'error', 
        message: 'playerId and playerName are required' 
      }));
      return;
    }

    // Find available room or create new one
    let availableRoom = this.findAvailableRoom();
    let isNewRoom = false;
    
    if (!availableRoom) {
      // Create new room
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      availableRoom = new Room(roomId);
      this.rooms.set(roomId, availableRoom);
      isNewRoom = true;
      console.log(`[${roomId}] New room created`);
    }

    const playerInfo = new PlayerInfo({
      id: playerId,
      name: playerName,
      ws: ws,
      joinedAt: Date.now().toString()
    });

    const roomId = availableRoom.id;
    availableRoom.addPlayer(playerInfo);
    
    console.log(`[${roomId}] Player joined: ${playerInfo.name} (${playerInfo.id}), total: ${availableRoom.players.size}/${GAME_CONFIG.MAX_PLAYERS}`);
    const joinedRoom = availableRoom;

    // Save to database
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://77q0bmlyb4.execute-api.us-east-1.amazonaws.com/prod';
      
      if (isNewRoom) {
        // Create new room in DB
        const response = await fetch(`${API_BASE_URL}/rooms/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            playerId,
            playerName
          })
        });
        
        if (!response.ok) {
          console.error(`Failed to create room in DB: ${response.status}`);
        }
      } else {
        // Join existing room in DB
        const response = await fetch(`${API_BASE_URL}/rooms/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            playerName
          })
        });
        
        if (!response.ok) {
          console.error(`Failed to join room in DB: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Failed to sync with database:', error);
    }
    
    // Send room info to client
    playerInfo.send({
      type: 'roomJoined',
      data: {
        roomId,
        playerCount: joinedRoom.players.size,
        maxPlayers: GAME_CONFIG.MAX_PLAYERS,
        players: joinedRoom.getPlayersArray()
      }
    });

    joinedRoom.broadcast({
      type: 'playerUpdate', 
      data: {
        playerInfo, 
        playerCount: availableRoom.players.size,
        players: availableRoom.getPlayersArray()
      } 
    });

    // Auto-start when max players join
    if (joinedRoom.players.size >= GAME_CONFIG.MAX_PLAYERS) {
      if (joinedRoom.state.state !== 'countdown' && joinedRoom.state.state !== 'playing') {
        console.log(`[${roomId}] Auto-starting game...`);
        this.startAutoGame(roomId);
      }
    }
  }

  private findAvailableRoom(): Room | null {
    for (const room of this.rooms.values()) {
      if (room.players.size < GAME_CONFIG.MAX_PLAYERS && room.state.state === 'waiting') {
        return room;
      }
    }
    return null;
  }

  handleMessage(roomId: string, message: ClientToServerMessage, ws: WebSocket) {
    try {
      console.log(`[${roomId}] Received message:`, message);
      
      switch (message.type) {
        case 'joinRoom':
          this.handleJoinRoom(ws, message);
          break; 
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  private startAutoGame(roomId: string) {
    const room = this.getRoom(roomId);
 
    room.startGame(this.docs);
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