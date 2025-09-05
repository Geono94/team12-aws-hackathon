import WebSocket from 'ws';
import { ClientToServerMessage, JoinRoomMessage, SearchRoomMessage } from '../types/messages';
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

  private async handleSearchRoom(ws: WebSocket, message: SearchRoomMessage) {
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

    console.log("availableRoom", availableRoom)

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
        players: joinedRoom.getPlayersForClient()
      }
    });

    joinedRoom.broadcast({
      type: 'playerUpdate', 
      data: {
        playerInfo: {
          id: playerInfo.id,
          name: playerInfo.name,
          joinedAt: playerInfo.joinedAt
          // WebSocket은 제외
        },
        playerCount: availableRoom.players.size,
        players: availableRoom.getPlayersForClient()
      } 
    });

    // Auto-start when max players join
    console.log(`[${roomId}] Checking auto-start: ${joinedRoom.players.size}/${GAME_CONFIG.MAX_PLAYERS} players, state: ${joinedRoom.state.state}`);
    if (joinedRoom.players.size >= GAME_CONFIG.MAX_PLAYERS) {
      console.log(`[${roomId}] Max players reached! Current state: ${joinedRoom.state.state}`);
      if (joinedRoom.state.state !== 'countdown' && joinedRoom.state.state !== 'playing') {
        console.log(`[${roomId}] Auto-starting game in 2 seconds...`);
        setTimeout(() => {
          this.startAutoGame(roomId);
        }, 4000); // 4초 지연 - 마지막 플레이어도 대기실 화면을 볼 수 있도록
      } else {
        console.log(`[${roomId}] Game already started or starting (state: ${joinedRoom.state.state})`);
      }
    } else {
      console.log(`[${roomId}] Waiting for more players (${joinedRoom.players.size}/${GAME_CONFIG.MAX_PLAYERS})`);
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

  private rejoinRoom(ws: WebSocket, message: JoinRoomMessage) {
    const { roomId, playerId, playerName } = message.data;
    const room = this.rooms.get(roomId);
    
    if (!room) {
      console.log(`[${roomId}] Room not found for rejoin, treating as new join`);
      // 룸이 없으면 searchRoom으로 처리
      this.handleSearchRoom(ws, {
        type: 'searchRoom',
        data: { playerId, playerName }
      });
      return;
    }

    // 이미 존재하는 플레이어면 재연결
    if (room.players.has(playerId)) {
      console.log(`[${roomId}] Player ${playerId} rejoining`);
      room.players.get(playerId)!.ws = ws;
      room.broadcastGameState();
      return;
    }

    // 새로운 플레이어면 추가
    console.log(`[${roomId}] New player ${playerId} joining via joinRoom`);
    const playerInfo = new PlayerInfo({
      id: playerId,
      name: playerName,
      ws: ws,
      joinedAt: Date.now().toString()
    });

    room.addPlayer(playerInfo);
    
    console.log(`[${roomId}] Player joined: ${playerInfo.name} (${playerInfo.id}), total: ${room.players.size}/${GAME_CONFIG.MAX_PLAYERS}`);

    // Send room info to client
    playerInfo.send({
      type: 'roomJoined',
      data: {
        roomId,
        playerCount: room.players.size,
        maxPlayers: GAME_CONFIG.MAX_PLAYERS,
        players: room.getPlayersForClient()
      }
    });

    room.broadcast({
      type: 'playerUpdate', 
      data: {
        playerInfo: {
          id: playerInfo.id,
          name: playerInfo.name,
          joinedAt: playerInfo.joinedAt
          // WebSocket은 제외
        },
        playerCount: room.players.size,
        players: room.getPlayersForClient()
      } 
    });

    // Auto-start when max players join
    console.log(`[${roomId}] Checking auto-start: ${room.players.size}/${GAME_CONFIG.MAX_PLAYERS} players, state: ${room.state.state}`);
    if (room.players.size >= GAME_CONFIG.MAX_PLAYERS) {
      console.log(`[${roomId}] Max players reached! Current state: ${room.state.state}`);
      if (room.state.state !== 'countdown' && room.state.state !== 'playing') {
        console.log(`[${roomId}] Auto-starting game in 2 seconds...`);
        setTimeout(() => {
          this.startAutoGame(roomId);
        }, 2000); // 2초 지연 - 마지막 플레이어도 대기실 화면을 볼 수 있도록
      } else {
        console.log(`[${roomId}] Game already started or starting (state: ${room.state.state})`);
      }
    } else {
      console.log(`[${roomId}] Waiting for more players (${room.players.size}/${GAME_CONFIG.MAX_PLAYERS})`);
    }
  }

  handleMessage(roomId: string, message: ClientToServerMessage, ws: WebSocket) {
    try {
      console.log(`[${roomId}] Received message:`, message);
      
      switch (message.type) {
        case 'searchRoom':
          this.handleSearchRoom(ws, message);
          break; 
        case 'joinRoom':
          this.rejoinRoom(ws, message);
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  private startAutoGame(roomId: string) {
    console.log(`[${roomId}] Starting auto game...`);
    const room = this.getRoom(roomId);
    console.log(`[${roomId}] Room found, calling startGame...`);
    room.startGame(this.docs);
    console.log(`[${roomId}] startGame called successfully`);
  }

  cleanup(playerId?: string | null) {
    if (!playerId) {
      return;
    }

    // for (const room of this.rooms.values()) {
    //   if (room.players.has(playerId)) {
 
    //       const player = room.players.get(playerId);
    //       if (!player) {
    //         return;
    //       }
          
    //       // Only cleanup if WebSocket is not in OPEN state
    //       if (player.ws.readyState !== WebSocket.OPEN) {
    //         room.removePlayer(playerId);
    //         // If room is empty, clean up everything
    //         if (room.isEmpty()) {
    //           console.log(`[${room.id}] Room is empty, cleaning up`);
    //           room.cleanup();
    //           this.rooms.delete(room.id);
    //         } else {
    //           // Broadcast updated player count
    //           room.broadcast({ 
    //             type: 'playerUpdate', 
    //             data: { playerCount: room.players.size } 
    //           });
    //         }
    //       }  
    //   }
    // }
  }
}