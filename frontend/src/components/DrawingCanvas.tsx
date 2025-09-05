'use client';

import { useRef, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface DrawingCanvasProps {
  roomId: string;
  playerId: string;
}

interface DrawPoint {
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function DrawingCanvas({ roomId, playerId }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'playing' | 'ended'>('waiting');
  const [topic, setTopic] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [playerCount, setPlayerCount] = useState<number>(1);
  
  // Yjs setup
  const [doc] = useState(() => new Y.Doc());
  const [yjsProvider, setYjsProvider] = useState<WebsocketProvider | null>(null);
  const [gameWs, setGameWs] = useState<WebSocket | null>(null);
  
  const drawingArray = doc.getArray('drawing');

  // Initialize WebSocket connections
  useEffect(() => {
    // Yjs WebSocket for drawing sync
    const provider = new WebsocketProvider('ws://localhost:3000/yjs', roomId, doc);
    setYjsProvider(provider);

    // Game WebSocket for game logic
    const gameSocket = new WebSocket('ws://localhost:3000/game');
    
    gameSocket.onopen = () => {
      gameSocket.send(JSON.stringify({
        action: 'joinGame',
        gameId: roomId,
        playerId,
      }));
    };

    gameSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleGameMessage(message);
    };

    setGameWs(gameSocket);

    return () => {
      provider.destroy();
      gameSocket.close();
    };
  }, [roomId, playerId, doc]);

  const handleGameMessage = (message: any) => {
    switch (message.action) {
      case 'playerJoined':
        setPlayerCount(message.playerCount);
        break;
      case 'gameStarting':
        setTopic(message.topic);
        setGameState('countdown');
        setCountdown(message.countdown);
        startCountdown();
        break;
      case 'gameStarted':
        setGameState('playing');
        setTimeLeft(30);
        startGameTimer();
        break;
      case 'gameEnded':
        setGameState('ended');
        break;
    }
  };

  const startCountdown = () => {
    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  };

  const startGameTimer = () => {
    let time = 30;
    const timer = setInterval(() => {
      time--;
      setTimeLeft(time);
      if (time <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  };

  const startGame = () => {
    if (gameWs && gameState === 'waiting') {
      gameWs.send(JSON.stringify({
        action: 'startGame',
        gameId: roomId,
      }));
    }
  };

  const submitDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: roomId,
          imageData,
        }),
      });

      const result = await response.json();
      console.log('AI Result:', result);
    } catch (error) {
      console.error('Failed to submit drawing:', error);
    }
  };

  // Drawing logic (same as before)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingArray.forEach((point: DrawPoint) => {
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [drawingArray]);

  useEffect(() => {
    const observer = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawingArray.forEach((point: DrawPoint) => {
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    drawingArray.observe(observer);
    return () => drawingArray.unobserve(observer);
  }, [drawingArray]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point: DrawPoint = {
      x,
      y,
      color: currentColor,
      size: brushSize,
    };

    drawingArray.push([point]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (gameState === 'playing') {
      drawingArray.delete(0, drawingArray.length);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Game Status */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <span className="text-lg font-semibold">Players: {playerCount}/4</span>
          {gameState === 'waiting' && (
            <button
              onClick={startGame}
              disabled={playerCount < 2}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Start Game
            </button>
          )}
        </div>
        
        {gameState === 'countdown' && (
          <div className="text-4xl font-bold text-red-500">
            {topic && <div className="text-2xl mb-2">Draw: {topic}</div>}
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        )}
        
        {gameState === 'playing' && (
          <div className="text-2xl font-bold">
            <div className="mb-2">Draw: {topic}</div>
            <div className="text-red-500">Time: {timeLeft}s</div>
          </div>
        )}
        
        {gameState === 'ended' && (
          <div className="text-2xl font-bold text-blue-500">
            <div>Time's up!</div>
            <button
              onClick={submitDrawing}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Generate AI Art
            </button>
          </div>
        )}
      </div>

      {/* Drawing Tools */}
      {gameState === 'playing' && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <label>Color:</label>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-8 h-8 rounded"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label>Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span>{brushSize}px</span>
          </div>
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={`border-2 border-gray-300 rounded-lg ${
          gameState === 'playing' ? 'cursor-crosshair' : 'cursor-not-allowed'
        } touch-none`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}
