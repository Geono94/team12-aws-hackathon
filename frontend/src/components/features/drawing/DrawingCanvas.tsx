'use client';

import { useRef, useEffect, useState } from 'react';
import { useYjs } from '@/contexts/YjsContext';
import { useGameRoom } from '@/hooks/useGameRoom';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { GAME_CONFIG } from '@/constants/game';
import { DrawPoint, GameStateType, AIGenerateRequest, ServerToClientMessage, ClientToServerMessage } from '@/types';

interface DrawingCanvasProps {
  roomId: string;
  playerId: string;
}

export default function DrawingCanvas({ roomId, playerId }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>(COLORS.primary.main);
  const [brushSize, setBrushSize] = useState(5);
  const [gameState, setGameState] = useState<GameStateType>('playing');
  const [topic, setTopic] = useState<string>('고양이');
  const [countdown, setCountdown] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [playerCount, setPlayerCount] = useState<number>(1);
  
  const { doc, connected, onMessage, sendMessage } = useYjs();
  const { clearDrawing } = useGameRoom(roomId);
  
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

  // Join game on mount
  useEffect(() => {
    const message: ClientToServerMessage = {
      type: 'playerJoin',
      playerId
    };
    sendMessage(message);
  }, [sendMessage, playerId]);

  // Sync local state with server messages
  useEffect(() => {
    return onMessage((message: ServerToClientMessage) => {
      if (message.type === 'gameStateUpdate') {
        const data = message.data;
        if (data.state) setGameState(data.state);
        if (data.topic) setTopic(data.topic);
        if (data.countdown !== undefined) setCountdown(data.countdown);
        if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
      } else if (message.type === 'playerUpdate') {
        setPlayerCount(message.data.playerCount);
      } else if (message.type === 'gameEnded') {
        window.location.href = message.data.redirectTo;
      }
    });
  }, [onMessage]);
  


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

  const submitDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    
    try {
      const requestData: AIGenerateRequest = {
        gameId: roomId,
        imageData,
      };

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('AI Result:', result);
    } catch (error) {
      console.error('Failed to submit drawing:', error);
    }
  };

  // Handle drawing with Yjs document
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

  if (!connected || !doc) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        background: '#f5f5f5',
        borderRadius: '8px',
        color: '#666'
      }}>
        연결 중...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: SPACING.md
    }}>
      {/* Game Status */}
      <div style={{ textAlign: 'center', marginBottom: SPACING.md }}>
        {gameState === 'waiting' ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: SPACING.lg,
            marginBottom: SPACING.sm
          }}>
            {/* Left Characters */}
            <div style={{ display: 'flex', gap: SPACING.sm }}>
              {[1, 2].map((charNumber) => {
                const isActive = charNumber <= playerCount;
                return (
                  <div
                    key={charNumber}
                    style={{
                      position: 'relative',
                      opacity: isActive ? 1 : 0.3,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    <img
                      src={`https://drawtogether-test-1757052413482.s3.us-east-1.amazonaws.com/images/char_${charNumber}.png`}
                      alt={`Character ${charNumber}`}
                      style={{
                        width: '90px',
                        height: '90px',
                        border: isActive ? `3px solid ${COLORS.primary.main}` : '3px solid transparent',
                        objectFit: 'contain',
                        transition: 'border 0.3s ease'
                      }}
                    />
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-5px',
                        right: '-5px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: COLORS.primary.accent,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Center Text */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: SPACING.xs }}>
                Players: {playerCount}/{GAME_CONFIG.MAX_PLAYERS}
              </div>
              {playerCount < GAME_CONFIG.MAX_PLAYERS && (
                <div style={{ fontSize: '16px', color: COLORS.neutral.text }}>
                  Waiting for more players...
                </div>
              )}
            </div>
            
            {/* Right Characters */}
            <div style={{ display: 'flex', gap: SPACING.sm }}>
              {[3, 4].map((charNumber) => {
                const isActive = charNumber <= playerCount;
                return (
                  <div
                    key={charNumber}
                    style={{
                      position: 'relative',
                      opacity: isActive ? 1 : 0.3,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    <img
                      src={`https://drawtogether-test-1757052413482.s3.us-east-1.amazonaws.com/images/char_${charNumber}.png`}
                      alt={`Character ${charNumber}`}
                      style={{
                        width: '90px',
                        height: '90px',
                        border: isActive ? `3px solid ${COLORS.primary.main}` : '3px solid transparent',
                        objectFit: 'contain',
                        transition: 'border 0.3s ease'
                      }}
                    />
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-5px',
                        right: '-5px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: COLORS.primary.accent,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: SPACING.sm }}>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Players: {playerCount}/{GAME_CONFIG.MAX_PLAYERS}</span>
          </div>
        )}
        
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
          width: GAME_CONFIG.CANVAS_SIZE.width,
          height: GAME_CONFIG.CANVAS_SIZE.height,
          touchAction: 'none'
        }}
      />
    </div>
  );
}
