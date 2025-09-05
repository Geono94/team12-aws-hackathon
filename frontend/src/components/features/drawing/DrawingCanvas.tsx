'use client';

import { useRef, useEffect, useState } from 'react';
import { useYjs } from '@/contexts/YjsContext';
import { useGameRoom } from '@/hooks/useGameRoom';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { GAME_CONFIG } from '@/constants/game';

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
  const [currentColor, setCurrentColor] = useState(COLORS.primary.main);
  const [brushSize, setBrushSize] = useState(5);
  const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'playing' | 'ended'>('waiting');
  const [topic, setTopic] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [playerCount, setPlayerCount] = useState<number>(1);
  
  const { doc } = useYjs();
  const { gameState: currentGameState, startGame: handleStartGame, clearDrawing } = useGameRoom(roomId);
  
  const drawingArray = doc?.getArray('drawing');

  const colors = [
    COLORS.primary.main,
    COLORS.primary.sub,
    COLORS.primary.accent,
    '#FFD93D',
    '#6BCF7F',
    '#FF8C42',
    '#9B59B6',
    '#2D3748'
  ];

  // Sync local state with Yjs game state
  useEffect(() => {
    if (currentGameState) {
      setGameState(currentGameState.state);
      setTopic(currentGameState.topic || '');
      setPlayerCount(currentGameState.players.length);
      
      if (currentGameState.state === 'countdown') {
        startCountdown();
      } else if (currentGameState.state === 'playing') {
        setTimeLeft(30);
        startGameTimer();
      }
    }
  }, [currentGameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = GAME_CONFIG.CANVAS_SIZE.width;
    canvas.height = GAME_CONFIG.CANVAS_SIZE.height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

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
    if (gameState === 'waiting') {
      handleStartGame();
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

  useEffect(() => {
    if (!drawingArray) return;
    
    const observer = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
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

    if (drawingArray) {
      drawingArray.push([point]);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (gameState === 'playing') {
      clearDrawing();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: SPACING.md
    }}>
      {/* Game Status */}
      <div style={{ textAlign: 'center', marginBottom: SPACING.md }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: SPACING.md,
          marginBottom: SPACING.sm 
        }}>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Players: {playerCount}/4</span>
          {gameState === 'waiting' && (
            <button
              onClick={startGame}
              disabled={playerCount < 1}
              style={{
                padding: `${SPACING.sm} ${SPACING.md}`,
                backgroundColor: COLORS.primary.accent,
                color: 'white',
                border: 'none',
                borderRadius: BORDER_RADIUS.md,
                cursor: playerCount >= 1 ? 'pointer' : 'not-allowed',
                opacity: playerCount >= 1 ? 1 : 0.5
              }}
            >
              Start Game
            </button>
          )}
        </div>
        
        {gameState === 'countdown' && (
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: COLORS.primary.main }}>
            {topic && <div style={{ fontSize: '24px', marginBottom: SPACING.sm }}>Draw: {topic}</div>}
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        )}
        
        {gameState === 'playing' && (
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <div style={{ marginBottom: SPACING.sm, color: COLORS.neutral.text }}>Draw: {topic}</div>
            <div style={{ color: timeLeft <= 10 ? COLORS.primary.main : COLORS.primary.accent }}>Time: {timeLeft}s</div>
          </div>
        )}
        
        {gameState === 'ended' && (
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.primary.accent }}>
            <div>Time's up!</div>
            <button
              onClick={submitDrawing}
              style={{
                marginTop: SPACING.sm,
                padding: `${SPACING.sm} ${SPACING.md}`,
                backgroundColor: COLORS.primary.accent,
                color: 'white',
                border: 'none',
                borderRadius: BORDER_RADIUS.md,
                cursor: 'pointer'
              }}
            >
              Generate AI Art
            </button>
          </div>
        )}
      </div>

      {/* Drawing Tools */}
      {gameState === 'playing' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.md,
          marginBottom: SPACING.md,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* Color Palette */}
          <div style={{ display: 'flex', gap: SPACING.xs }}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: currentColor === color ? `3px solid ${COLORS.neutral.text}` : '2px solid white',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            ))}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
            <label>Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              style={{ width: '80px' }}
            />
            <span>{brushSize}px</span>
          </div>
          
          <button
            onClick={clearCanvas}
            style={{
              padding: `${SPACING.xs} ${SPACING.sm}`,
              backgroundColor: COLORS.primary.main,
              color: 'white',
              border: 'none',
              borderRadius: BORDER_RADIUS.sm,
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          border: `2px solid ${COLORS.neutral.border}`,
          borderRadius: BORDER_RADIUS.sm,
          cursor: gameState === 'playing' ? 'crosshair' : 'not-allowed',
          background: 'white',
          maxWidth: '100%',
          height: 'auto',
          touchAction: 'none'
        }}
      />
    </div>
  );
}
