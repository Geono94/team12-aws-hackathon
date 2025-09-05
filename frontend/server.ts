import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import WebSocket from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import * as Y from 'yjs';

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

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection from:', req.url);
    
    const docName = req.url?.slice(1) || 'default';
    console.log('Document name:', docName);
    
    setupWSConnection(ws, req, {
      callback: (doc: Y.Doc) => {
        console.log(`Document connected: ${docName} (${doc.guid})`);
        
        // Set up observers on the actual Yjs document
        const gameState = doc.getMap('gameState');
        const players = doc.getArray('players');
        const drawing = doc.getArray('drawing');
        
        gameState.observe(() => {
          console.log(`[${docName}] GameState:`, gameState.toJSON());
        });
        
        players.observe(() => {
          console.log(`[${docName}] Players:`, players.toArray());
        });
        
        drawing.observe(() => {
          console.log(`[${docName}] Drawing length:`, drawing.length);
        });
        
        doc.on('update', (update, origin) => {
          console.log(`[${docName}] Document updated, size: ${update.length}`);
        });
      }
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