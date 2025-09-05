import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import WebSocket from 'ws';
import { GameManager, setupYjsWebSocket, setupGameWebSocket } from './src/lib/websocket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const gameManager = new GameManager();

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

  // Yjs WebSocket server
  const yjsWss = new WebSocket.Server({ 
    server,
    path: '/yjs'
  });
  setupYjsWebSocket(yjsWss);

  // Game WebSocket server
  const gameWss = new WebSocket.Server({ 
    server,
    path: '/game'
  });
  setupGameWebSocket(gameWss, gameManager);

  server.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Yjs WebSocket on ws://${hostname}:${port}/yjs`);
    console.log(`> Game WebSocket on ws://${hostname}:${port}/game`);
  });
});