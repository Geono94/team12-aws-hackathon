const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Game state management
const games = new Map();
const connections = new Map();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // WebSocket server for Yjs
  const wss = new WebSocket.Server({ 
    server,
    path: '/yjs'
  });

  wss.on('connection', (ws, req) => {
    console.log('New Yjs WebSocket connection');
    setupWSConnection(ws, req);
  });

  // WebSocket server for game logic
  const gameWss = new WebSocket.Server({ 
    server,
    path: '/game'
  });

  gameWss.on('connection', (ws) => {
    console.log('New game WebSocket connection');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleGameMessage(ws, data);
      } catch (error) {
        console.error('Game message error:', error);
      }
    });

    ws.on('close', () => {
      // Clean up connection
      for (const [connectionId, connection] of connections.entries()) {
        if (connection.ws === ws) {
          connections.delete(connectionId);
          break;
        }
      }
    });
  });

  function handleGameMessage(ws, message) {
    switch (message.action) {
      case 'joinGame':
        handleJoinGame(ws, message);
        break;
      case 'startGame':
        handleStartGame(ws, message);
        break;
      case 'endGame':
        handleEndGame(ws, message);
        break;
    }
  }

  function handleJoinGame(ws, message) {
    const { gameId, playerId } = message;
    
    if (!games.has(gameId)) {
      games.set(gameId, {
        id: gameId,
        players: new Set(),
        state: 'waiting',
        topic: null,
        startTime: null,
      });
    }

    const game = games.get(gameId);
    if (game.players.size >= 4) {
      ws.send(JSON.stringify({ action: 'error', message: 'Game is full' }));
      return;
    }

    game.players.add(playerId);
    connections.set(playerId, { ws, gameId });

    // Broadcast to all players in the game
    broadcastToGame(gameId, {
      action: 'playerJoined',
      playerId,
      playerCount: game.players.size,
    });
  }

  function handleStartGame(ws, message) {
    const { gameId } = message;
    const game = games.get(gameId);
    
    if (!game) return;

    const topics = ['cat', 'house', 'tree', 'car', 'flower', 'sun', 'dog', 'bird'];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    game.topic = topic;
    game.state = 'countdown';
    game.startTime = Date.now();

    broadcastToGame(gameId, {
      action: 'gameStarting',
      topic,
      countdown: 3,
    });

    // Start countdown
    setTimeout(() => {
      game.state = 'playing';
      broadcastToGame(gameId, {
        action: 'gameStarted',
        topic,
        duration: 30000,
      });

      // Auto-end game after 30 seconds
      setTimeout(() => {
        handleEndGame(ws, { gameId });
      }, 30000);
    }, 3000);
  }

  function handleEndGame(ws, message) {
    const { gameId } = message;
    const game = games.get(gameId);
    
    if (!game) return;

    game.state = 'ended';
    
    broadcastToGame(gameId, {
      action: 'gameEnded',
      topic: game.topic,
    });
  }

  function broadcastToGame(gameId, message) {
    const game = games.get(gameId);
    if (!game) return;

    game.players.forEach(playerId => {
      const connection = connections.get(playerId);
      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
      }
    });
  }

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Yjs WebSocket on ws://${hostname}:${port}/yjs`);
    console.log(`> Game WebSocket on ws://${hostname}:${port}/game`);
  });
});

// Lambda handler for serverless deployment
module.exports.handler = async (event, context) => {
  // For Lambda deployment, we'll need to handle HTTP events
  // This is a simplified version for Lambda
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: 'Next.js Lambda Handler',
  };
};
