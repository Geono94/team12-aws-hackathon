const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');

const wss = new WebSocket.Server({ port: 1234 });

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  setupWSConnection(ws, req);
});

console.log('Yjs WebSocket server running on ws://localhost:1234');
