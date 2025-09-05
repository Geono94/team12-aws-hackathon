import WebSocket from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import * as Y from 'yjs';

export interface GameState {
  id: string;
  players: Set<string>;
  state: 'waiting' | 'countdown' | 'playing' | 'ended';
  topic: string | null;
  startTime: number | null;
  ydoc: Y.Doc;
}

export interface Connection {
  ws: WebSocket;
  gameId: string;
}

export class GameManager {
  private games = new Map<string, GameState>();
  private connections = new Map<string, Connection>();
  private ydocs = new Map<string, Y.Doc>();

  createGame(gameId: string): GameState {
    const ydoc = new Y.Doc();
    const gameState = ydoc.getMap('gameState');
    const players = ydoc.getArray('players');
    
    gameState.set('id', gameId);
    gameState.set('state', 'waiting');
    gameState.set('topic', null);
    gameState.set('startTime', null);
    
    const game: GameState = {
      id: gameId,
      players: new Set(),
      state: 'waiting',
      topic: null,
      startTime: null,
      ydoc,
    };
    
    this.games.set(gameId, game);
    this.ydocs.set(gameId, ydoc);
    return game;
  }

  getGame(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  addConnection(playerId: string, ws: WebSocket, gameId: string): void {
    this.connections.set(playerId, { ws, gameId });
  }

  removeConnection(playerId: string): void {
    this.connections.delete(playerId);
  }

  broadcastToGame(gameId: string, message: any): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.players.forEach(playerId => {
      const connection = this.connections.get(playerId);
      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
      }
    });
  }

  handleJoinGame(ws: WebSocket, message: { gameId: string; playerId: string }): void {
    const { gameId, playerId } = message;
    
    let game = this.getGame(gameId);
    if (!game) {
      game = this.createGame(gameId);
    }

    if (game.players.size >= 4) {
      ws.send(JSON.stringify({ action: 'error', message: 'Game is full' }));
      return;
    }

    game.players.add(playerId);
    this.addConnection(playerId, ws, gameId);

    // Update Yjs shared state
    const players = game.ydoc.getArray('players');
    players.push([playerId]);

    this.broadcastToGame(gameId, {
      action: 'playerJoined',
      playerId,
      playerCount: game.players.size,
    });
  }

  handleStartGame(message: { gameId: string }): void {
    const { gameId } = message;
    const game = this.getGame(gameId);
    
    if (!game) return;

    const topics = ['cat', 'house', 'tree', 'car', 'flower', 'sun', 'dog', 'bird'];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    game.topic = topic;
    game.state = 'countdown';
    game.startTime = Date.now();

    // Update Yjs shared state
    const gameState = game.ydoc.getMap('gameState');
    gameState.set('topic', topic);
    gameState.set('state', 'countdown');
    gameState.set('startTime', game.startTime);

    this.broadcastToGame(gameId, {
      action: 'gameStarting',
      topic,
      countdown: 3,
    });

    setTimeout(() => {
      game.state = 'playing';
      gameState.set('state', 'playing');
      
      this.broadcastToGame(gameId, {
        action: 'gameStarted',
        topic,
        duration: 30000,
      });

      setTimeout(() => {
        this.handleEndGame({ gameId });
      }, 30000);
    }, 3000);
  }

  handleEndGame(message: { gameId: string }): void {
    const { gameId } = message;
    const game = this.getGame(gameId);
    
    if (!game) return;

    game.state = 'ended';
    
    // Update Yjs shared state
    const gameState = game.ydoc.getMap('gameState');
    gameState.set('state', 'ended');
    
    this.broadcastToGame(gameId, {
      action: 'gameEnded',
      topic: game.topic,
    });
  }

  getYDoc(gameId: string): Y.Doc | undefined {
    return this.ydocs.get(gameId);
  }
}

export function setupYjsWebSocket(wss: WebSocket.Server): void {
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection from:', req.url);
    
    // Setup Yjs connection with logging
    const conn = setupWSConnection(ws, req);
    
    // Log Yjs document changes
    if (conn && conn.doc) {
      conn.doc.on('update', (update: Uint8Array, origin: any) => {
        console.log(`[Yjs] Document updated:`, {
          docName: conn.doc?.guid,
          updateSize: update.length,
          origin: origin?.constructor?.name || 'unknown'
        });
      });
      
      conn.doc.on('subdocs', ({ added, removed }: { added: Set<Y.Doc>, removed: Set<Y.Doc> }) => {
        console.log(`[Yjs] Subdocs changed:`, {
          added: added.size,
          removed: removed.size
        });
      });
      
      // Log specific map and array changes
      const gameState = conn.doc.getMap('gameState');
      const players = conn.doc.getArray('players');
      const drawing = conn.doc.getMap('drawing');
      
      gameState.observe((event) => {
        console.log(`[Yjs] GameState changed:`, {
          changes: Array.from(event.changes.keys.entries()).map(([key, change]) => ({
            key,
            action: change.action,
            oldValue: change.oldValue,
            newValue: gameState.get(key)
          }))
        });
      });
      
      players.observe((event) => {
        console.log(`[Yjs] Players changed:`, {
          changes: event.changes.delta,
          currentPlayers: players.toArray()
        });
      });
      
      drawing.observe((event) => {
        console.log(`[Yjs] Drawing changed:`, {
          changes: Array.from(event.changes.keys.entries()).map(([key, change]) => ({
            key,
            action: change.action
          }))
        });
      });
    }
  });
}