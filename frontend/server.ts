import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import WebSocket from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { GameManager } from './src/server/GameManager';
import { ClientToServerMessage } from '@/types';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const wsPort = process.env.WS_PORT || 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Separate WebSocket server on different port
  const wsServer = createServer();
  const wss = new WebSocket.Server({ 
    server: wsServer,
    verifyClient: (info) => {
      console.log('WebSocket connection attempt:', info.req.url);
      return true;
    }
  });

  const gameManager = new GameManager();

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection from:', req.url);
    
    const roomId = req.url?.slice(1) || 'default';
    let playerId: string | null = null;
    console.log('Room ID:', roomId);
    
    setupWSConnection(ws, req); 
    
    ws.on('message', (data) => {
      try {
        // Try to parse as JSON for game messages
        const message = JSON.parse(data.toString()) as ClientToServerMessage;
        
        // Only handle if it's a game message (has type property)
        if (message.type && typeof message.type === 'string') {
          console.log('Game message:', message);
          
          // Store playerId for cleanup
          if (message.type === 'searchRoom' && message.data) {
            playerId = message.data.playerId;
          }
          
          gameManager.handleMessage(roomId, message, ws);
        }
        // Otherwise, let Yjs handle it (binary data or Yjs protocol)
      } catch (error) {
        // If JSON parsing fails, it's likely a Yjs binary message
        // Let setupWSConnection handle it
      }
    });
    
    ws.on('close', () => {
      console.log(`WebSocket disconnected from: ${roomId}`); 
      gameManager.cleanup(playerId);
    });
  });

  server.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  wsServer.listen(wsPort, (err?: Error) => {
    if (err) throw err;
    console.log(`> WebSocket on ws://${hostname}:${wsPort}`);
  });
});