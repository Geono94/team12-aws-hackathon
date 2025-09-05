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

// GameManager is no longer needed since Yjs handles all state management

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