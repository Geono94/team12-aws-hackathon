import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import WebSocket from 'ws';
import { setupYjsWebSocket } from './src/lib/websocket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

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

  // Yjs WebSocket server (handles both drawing and game state)
  const wss = new WebSocket.Server({ 
    server,
    path: '/',
    verifyClient: (info) => {
      console.log('WebSocket connection attempt:', info.req.url);
      return true;
    }
  });
  setupYjsWebSocket(wss);

  server.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket on ws://${hostname}:${port}`);
  });
});