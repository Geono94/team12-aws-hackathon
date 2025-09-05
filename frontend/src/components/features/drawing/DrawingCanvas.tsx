'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useYjs } from '@/contexts/YjsContext';
import { useGameRoom } from '@/hooks/useGameRoom';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { GAME_CONFIG } from '@/constants/game';
import { DrawPoint, GameStateType, ServerToClientMessage } from '@/types';
import TopicSelection from './TopicSelection';
import { PlayerInfo } from '@/server/Room';
import Button from '@/components/ui/Button';
import { getPlayer } from '@/lib/player';
import { leaveRoom } from '@/lib/api/room';
import { getStroke } from 'perfect-freehand';

interface StrokeData {
  color: string;
  size: number;
  pathData: string;
}

interface DrawingCanvasProps {
  roomId: string;
}

export default function DrawingCanvas({ roomId }: DrawingCanvasProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const previewRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>(COLORS.primary.main);
  const [brushSize, setBrushSize] = useState(5);
  const [currentStroke, setCurrentStroke] = useState<number[][]>([]);
  const [gameState, setGameState] = useState<GameStateType>('waiting');
  const [topic, setTopic] = useState<string>('고양이');
  const [countdown, setCountdown] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

  const { doc, connected, onMessage, sendMessage } = useYjs();
  const { clearDrawing } = useGameRoom(roomId);

  const handleLeaveRoom = async () => {
    try {
      const playerId = getPlayer().id;
      await leaveRoom(roomId, playerId);
      router.push('/');
    } catch (error) {
      console.error('Error leaving room:', error);
      router.push('/');
    }
  };

  useEffect(() => {
    const player = getPlayer();
    if (!player) return;

    sendMessage({
      type: 'joinRoom',
      data: {
        roomId,
        playerId: player.id,
        playerName: player.name,
      }
    })
  }, [])

  const strokesArray = doc?.getArray<StrokeData>('strokes');

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

  useEffect(() => {
    return onMessage((message: ServerToClientMessage) => {
      console.log('Received message:', message);

      if (message.type === 'gameStateUpdate') {
        const data = message.data;
        if (data.state) setGameState(data.state);
        if (data.topic) setTopic(data.topic);
        if (data.countdown !== undefined) setCountdown(data.countdown);
        if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
        
        if (data.players && Array.isArray(data.players)) {
          setPlayers(data.players);
          setPlayerCount(data.players.length);
        }
      } else if (message.type === 'playerUpdate') {
        const newPlayerCount = message.data.playerCount;
        setPlayerCount(newPlayerCount);
        
        const updatedPlayers: PlayerInfo[] = Array.from({ length: newPlayerCount }, (_, index) => ({
          id: `player_${index + 1}`,
          name: `플레이어 ${index + 1}`,
          joinedAt: Date.now().toString()
        }));
        setPlayers(updatedPlayers);
      } else if (message.type === 'roomJoined') {
        if (message.data.players && Array.isArray(message.data.players)) {
          setPlayers(message.data.players);
          setPlayerCount(message.data.players.length);
        } else {
          setPlayerCount(message.data.playerCount);
        }
      } else if (message.type === 'gameEnded') {
        window.location.href = message.data.redirectTo;
      } else if (message.type === 'kickRoom') {
        window.location.href = '/';
      }
    });
  }, [onMessage]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayWidth = GAME_CONFIG.CANVAS_SIZE.width;
    const displayHeight = GAME_CONFIG.CANVAS_SIZE.height;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    ctx.scale(dpr, dpr);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
  };

  useEffect(() => {
    resizeCanvas();
    
    const handleResize = () => {
      setTimeout(resizeCanvas, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [strokesArray]);

  useEffect(() => {
    if (!strokesArray || !svgRef.current) return;

    const observer = () => {
      const svg = svgRef.current;
      if (!svg) return;

      svg.innerHTML = '';
      
      strokesArray.forEach((strokeData: StrokeData) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', strokeData.pathData);
        path.setAttribute('fill', strokeData.color);
        svg.appendChild(path);
      });
    };

    strokesArray.observe(observer);
    return () => strokesArray.unobserve(observer);
  }, [strokesArray]);

  const getSvgPathFromStroke = (stroke: number[][]) => {
    if (!stroke.length) return '';
    
    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        return acc;
      },
      ['M', ...stroke[0], 'Q']
    );
    
    d.push('Z');
    return d.join(' ');
  };

  const getEventPos = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX || 0;
      clientY = e.touches[0]?.clientY || e.changedTouches[0]?.clientY || 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * (GAME_CONFIG.CANVAS_SIZE.width / rect.width);
    const y = (clientY - rect.top) * (GAME_CONFIG.CANVAS_SIZE.height / rect.height);
    
    return [x, y, Date.now()];
  };

  const startDrawing = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    setIsDrawing(true);
    
    const point = getEventPos(e);
    setCurrentStroke([point]);
  };

  const draw = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDrawing || gameState !== 'playing') return;
    e.preventDefault();

    const point = getEventPos(e);
    const newStroke = [...currentStroke, point];
    setCurrentStroke(newStroke);
    
    // Real-time preview
    if (previewRef.current && newStroke.length > 1) {
      const stroke = getStroke(newStroke, {
        size: brushSize * 2,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      });
      
      const pathData = getSvgPathFromStroke(stroke);
      
      previewRef.current.innerHTML = '';
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', currentColor);
      path.setAttribute('opacity', '0.8');
      previewRef.current.appendChild(path);
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e) e.preventDefault();
    if (!isDrawing || currentStroke.length === 0) return;
    
    setIsDrawing(false);
    
    const stroke = getStroke(currentStroke, {
      size: brushSize * 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });
    
    const pathData = getSvgPathFromStroke(stroke);
    
    const strokeData: StrokeData = {
      color: currentColor,
      size: brushSize,
      pathData
    };
    
    if (strokesArray) {
      strokesArray.push([strokeData]);
    }
    
    // Clear preview
    if (previewRef.current) {
      previewRef.current.innerHTML = '';
    }
    
    setCurrentStroke([]);
  };

  const clearCanvas = () => {
    if (gameState === 'playing' && strokesArray) {
      strokesArray.delete(0, strokesArray.length);
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
      <div style={{ textAlign: 'center', marginBottom: SPACING.md }}>
        {gameState === 'waiting' ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: SPACING.lg,
            marginBottom: SPACING.sm
          }}>
            <div style={{ 
                  background: '#000000',
                  minHeight: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: SPACING.lg
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: SPACING.md,
                    marginBottom: SPACING.xl
                  }}>
                    <div style={{
                      fontSize: '48px'
                    }}>
                      🎮
                    </div>
                    <h1 style={{ 
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                      margin: 0
                    }}>
                      대기실
                    </h1>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: SPACING.xl,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    minWidth: '400px',
                    maxWidth: '500px'
                  }}>
                    <div style={{ 
                      textAlign: 'center',
                      marginBottom: SPACING.xl,
                      padding: SPACING.lg,
                      background: COLORS.primary.main,
                      borderRadius: '12px',
                      color: 'white'
                    }}>
                      <p style={{ 
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}>
                        {players.length}/{GAME_CONFIG.MAX_PLAYERS} 명 참여 중
                      </p>
                    </div>

                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: SPACING.md,
                      marginBottom: SPACING.xl
                    }}>
                      {Array.from({ length: GAME_CONFIG.MAX_PLAYERS }).map((_, index) => {
                        const player = players[index];
                        return (
                          <div
                            key={index}
                            style={{
                              padding: SPACING.lg,
                              background: player 
                                ? COLORS.primary.main
                                : 'rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              color: player ? 'white' : '#888888',
                              fontWeight: '600',
                              textAlign: 'center',
                              fontSize: '16px',
                              border: player ? 'none' : '1px dashed rgba(255,255,255,0.2)'
                            }}
                          >
                            {player ? (
                              <>
                                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                  <img 
                                    src={`https://drawtogether-test-1757052413482.s3.us-east-1.amazonaws.com/images/char_${index + 1}.gif`}
                                    alt={`Character ${index + 1}`}
                                    style={{
                                      width: '96px',
                                      height: '96px',
                                      borderRadius: '8px',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </div>
                                {player.name}
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                                대기 중...
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ 
                      display: 'flex',
                      gap: SPACING.md,
                      justifyContent: 'center'
                    }}>
                      <Button 
                        variant="outline" 
                        onClick={handleLeaveRoom}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 24px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: 'rgba(255,255,255,0.1)',
                          color: '#FFFFFF'
                        }}
                      >
                        🚪 나가기
                      </Button>
                    </div>
                  </div>
                </div>
          </div>
        ) : gameState === 'topicSelection' ? (
          <TopicSelection selectedTopic={topic} />
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
      </div>

      {gameState === 'playing' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.md,
          marginBottom: SPACING.md,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
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

      <div
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        style={{
          position: 'relative',
          border: `2px solid ${COLORS.neutral.border}`,
          borderRadius: BORDER_RADIUS.sm,
          cursor: gameState === 'playing' ? 'crosshair' : 'not-allowed',
          background: 'white',
          width: GAME_CONFIG.CANVAS_SIZE.width,
          height: GAME_CONFIG.CANVAS_SIZE.height,
          touchAction: 'none'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
          viewBox={`0 0 ${GAME_CONFIG.CANVAS_SIZE.width} ${GAME_CONFIG.CANVAS_SIZE.height}`}
        />
        <svg
          ref={previewRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2
          }}
          viewBox={`0 0 ${GAME_CONFIG.CANVAS_SIZE.width} ${GAME_CONFIG.CANVAS_SIZE.height}`}
        />
      </div>
    </div>
  );
}