'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useYjs } from '@/contexts/YjsContext';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { GAME_CONFIG } from '@/constants/game';
import { GameStateType, ServerToClientMessage } from '@/types';
import TopicSelection from './TopicSelection';
import { PlayerData, PlayerInfo } from '@/server/Room';
import { getPlayer } from '@/lib/player';
import { leaveRoom } from '@/lib/api/room';
import { getStroke } from 'perfect-freehand';
import { ColorPalette } from './ColorPalette';
import { BrushSizeSelector } from './BrushSizeSelector';
import { InviteButton } from '../../ui/InviteButton';
import { LeaveButton } from '../../ui/LeaveButton';

// PlayerAvatar 컴포넌트
const PlayerAvatar = ({ player, index }: { player?: PlayerInfo; index: number }) => {
  const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFB347'];
  
  return (
    <div style={{
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      border: `3px solid ${player ? avatarColors[index] : 'rgba(255,255,255,0.2)'}`,
      background: player 
        ? `linear-gradient(135deg, ${avatarColors[index]}, ${avatarColors[index]}88)`
        : 'rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      backdropFilter: 'blur(10px)',
      boxShadow: player 
        ? `0 4px 16px ${avatarColors[index]}40`
        : '0 4px 16px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease'
    }}>
      {player ? (
        <>
          <img 
            src={`/characters/character${index + 1}.svg`}
            alt={`Character ${index + 1}`}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '4px',
              animation: index % 2 === 0 
                ? `bounce 2.5s ease-in-out infinite ${index * 0.4}s` 
                : `wiggle 2.2s ease-in-out infinite ${index * 0.4}s`,
              animationFillMode: 'both'
            }}
          />
          <div style={{
            fontSize: '10px',
            fontWeight: '600',
            color: '#FFFFFF',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            maxWidth: '70px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {player.name}
          </div>
          {/* 준비 완료 표시 */}
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#4CAF50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            animation: 'sparkle 1.5s ease-in-out infinite'
          }}>
            ✓
          </div>
        </>
      ) : (
        <>
          <div style={{
            fontSize: '24px',
            marginBottom: '4px',
            opacity: 0.6
          }}>
            ⏳
          </div>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: '500'
          }}>
            대기 중
          </div>
        </>
      )}
    </div>
  );
};

interface StrokeData {
  color: string;
  size: number;
  pathData: string;
}

interface TempStrokeData {
  id: string;
  color: string;
  size: number;
  pathData: string;
  playerId: string;
  playerName: string;
  lastPoint?: [number, number];
}

interface DrawingCanvasProps {
  roomId: string;
}

export default function DrawingCanvas({ roomId }: DrawingCanvasProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const previewRef = useRef<SVGSVGElement>(null);
  const cursorsRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>(COLORS.primary.main);
  const [brushSize, setBrushSize] = useState(3);
  const [currentStroke, setCurrentStroke] = useState<number[][]>([]);
  const [currentStrokeId, setCurrentStrokeId] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [gameState, setGameState] = useState<GameStateType>('waiting');
  const [topic, setTopic] = useState<string>('고양이');
  const [countdown, setCountdown] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [players, setPlayers] = useState<PlayerData[]>([]);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [gameStartCountdown, setGameStartCountdown] = useState<number>(0);

  // 토스트 알림 표시 함수
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 플레이어 변화 감지 및 토스트 알림
  useEffect(() => {
    const currentPlayerCount = players.length;
    if (currentPlayerCount === GAME_CONFIG.MAX_PLAYERS && gameStartCountdown === 0) {
      setGameStartCountdown(GAME_CONFIG.COUNTDOWN_TIME);
      const countdownInterval = setInterval(() => {
        setGameStartCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [players.length, gameStartCountdown]);

  const { doc, connected, onMessage, sendMessage } = useYjs();

  const handleLeaveRoom = async () => {
    try {
      const player = getPlayer();
      if (!player) {  
        throw new Error('Player not found');
      }
      const playerId = player.id;
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
  const tempStrokesMap = doc?.getMap<TempStrokeData>('tempStrokes');

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
        if (data.topic) {
          setTopic(data.topic);
          // topic을 localStorage에 저장
          localStorage.setItem(`gameTopic_${roomId}`, data.topic);
        }
        if (data.countdown !== undefined) setCountdown(data.countdown);
        if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
        
        if (data.players && Array.isArray(data.players)) {
          setPlayers(data.players);
          setPlayerCount(data.players.length);
        }
      } else if (message.type === 'playerUpdate') {
        const newPlayerCount = message.data.playerCount;
        setPlayerCount(newPlayerCount);
        
        const updatedPlayers: PlayerData[] = Array.from({ length: newPlayerCount }, (_, index) => ({
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
        router.push(message.data.redirectTo);
      } else if (message.type === 'kickRoom') {
        router.push('/')
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
    if (!strokesArray || !tempStrokesMap || !svgRef.current) return;

    const renderStrokes = () => {
      const svg = svgRef.current;
      const cursors = cursorsRef.current;
      if (!svg) return;

      svg.innerHTML = '';
      if (cursors) cursors.innerHTML = '';
      
      // Render completed strokes
      strokesArray.forEach((strokeData: StrokeData) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', strokeData.pathData);
        path.setAttribute('fill', strokeData.color);
        svg.appendChild(path);
      });
      
      // Render temporary strokes and cursors
      tempStrokesMap.forEach((tempStroke: TempStrokeData) => {
        if (tempStroke.pathData) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', tempStroke.pathData);
          path.setAttribute('fill', tempStroke.color);
          path.setAttribute('opacity', '0.8');
          svg.appendChild(path);
        }
        
        // Show cursor with player name
        if (cursors && tempStroke.lastPoint && tempStroke.playerId !== getPlayer()?.id) {
          const [x, y] = tempStroke.lastPoint;
          const cursor = document.createElement('div');
          cursor.style.position = 'absolute';
          cursor.style.left = `${x}px`;
          cursor.style.top = `${y - 30}px`;
          cursor.style.background = tempStroke.color;
          cursor.style.color = 'white';
          cursor.style.padding = '4px 8px';
          cursor.style.borderRadius = '12px';
          cursor.style.fontSize = '12px';
          cursor.style.fontWeight = 'bold';
          cursor.style.pointerEvents = 'none';
          cursor.style.zIndex = '10';
          cursor.style.transform = 'translateX(-50%)';
          cursor.textContent = tempStroke.playerName;
          cursors.appendChild(cursor);
        }
      });
    };

    strokesArray.observe(renderStrokes);
    tempStrokesMap.observe(renderStrokes);
    
    return () => {
      strokesArray.unobserve(renderStrokes);
      tempStrokesMap.unobserve(renderStrokes);
    };
  }, [strokesArray, tempStrokesMap]);

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
    
    const strokeId = `${getPlayer()?.id}_${Date.now()}`;
    setCurrentStrokeId(strokeId);
  };

  const draw = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const player = getPlayer();
    if (!player) return;
    if (!isDrawing || gameState !== 'playing') return;
    e.preventDefault();

    const point = getEventPos(e);
    const newStroke = [...currentStroke, point];
    setCurrentStroke(newStroke);
    
    const now = Date.now();
    const shouldSync = now - lastSyncTime > 100;
    
    // Update temp stroke for real-time sync
    if (tempStrokesMap && currentStrokeId && newStroke.length > 1 && shouldSync) {
      const stroke = getStroke(newStroke, {
        size: brushSize * 2,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      });
      
      const pathData = getSvgPathFromStroke(stroke);
      
      const tempStrokeData: TempStrokeData = {
        id: currentStrokeId,
        color: currentColor,
        size: brushSize,
        pathData,
        playerId: player.id,
        playerName: player.name,
        lastPoint: [point[0], point[1]]
      };
      
      tempStrokesMap.set(currentStrokeId, tempStrokeData);
      setLastSyncTime(now);
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e) e.preventDefault();
    if (!isDrawing || currentStroke.length === 0) return;
    
    setIsDrawing(false);
    
    // Add completed stroke to permanent array
    if (strokesArray && currentStroke.length > 1) {
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
      
      strokesArray.push([strokeData]);
    }
    
    // Remove temp stroke
    if (tempStrokesMap && currentStrokeId) {
      tempStrokesMap.delete(currentStrokeId);
    }
    
    setCurrentStroke([]);
    setCurrentStrokeId('');
    setLastSyncTime(0);
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
      touchAction: 'none',
      userSelect: 'none',
      overflowX: 'hidden',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'transparent'
    }}>
      <div style={{ textAlign: 'center', marginBottom: SPACING.md }}>
        {gameState === 'waiting' ? (
          <div style={{
            background: '#000000',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* 토스트 알림 */}
            {showToast && (
              <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(128,128,128,0.9)',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                zIndex: 1000,
                animation: 'slideDown 0.3s ease-out',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
              }}>
                {toastMessage}
              </div>
            )}

            {/* 상단 헤더 - 단순화 */}
            <div style={{
              padding: '20px',
              textAlign: 'center'
            }}>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px 120px 20px', // 하단 버튼 공간 확보
              position: 'relative'
            }}>
              {/* 2x2 플레이어 그리드 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px',
                marginBottom: '32px',
                width: '100%',
                maxWidth: '320px'
              }}>
                {Array.from({ length: GAME_CONFIG.MAX_PLAYERS }).map((_, index) => {
                  const player = players[index];
                  const slotColors = ['#FF6B6B', '#4ECDC4', '#FFB347', '#9B59B6'];
                  
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        animation: player ? 'bounceIn 0.6s ease-out' : 'none',
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: `3px solid ${player ? slotColors[index] : 'rgba(255,255,255,0.2)'}`,
                        background: player 
                          ? `linear-gradient(135deg, ${slotColors[index]}20, ${slotColors[index]}10)`
                          : 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        backdropFilter: 'blur(10px)',
                        boxShadow: player 
                          ? `0 8px 24px ${slotColors[index]}30`
                          : '0 4px 16px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        animation: player ? 'none' : 'waitingPulse 2s ease-in-out infinite'
                      }}>
                        {player ? (
                          <>
                            <img 
                              src={`/characters/character${index + 1}.svg`}
                              alt={`Character ${index + 1}`}
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginBottom: '8px',
                                animation: index % 2 === 0 
                                  ? `bounce 2s ease-in-out infinite ${index * 0.3}s` 
                                  : `wiggle 1.8s ease-in-out infinite ${index * 0.3}s`,
                                animationFillMode: 'both'
                              }}
                            />
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#FFFFFF',
                              textAlign: 'center',
                              maxWidth: '100px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {player.name}
                            </div>
                            {/* 준비 완료 체크마크 */}
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#4CAF50',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              color: '#FFFFFF',
                              animation: 'sparkle 1.5s ease-in-out infinite'
                            }}>
                              ✓
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{
                              fontSize: '32px',
                              marginBottom: '8px',
                              opacity: 0.4
                            }}>
                              ⏳
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: 'rgba(255,255,255,0.5)',
                              fontWeight: '500'
                            }}>
                              대기 중...
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 상태 메시지 */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                {gameStartCountdown > 0 ? (
                  <div style={{
                    background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    animation: 'pulse 1s ease-in-out infinite'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      marginBottom: '8px'
                    }}>🎉</div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                      marginBottom: '4px'
                    }}>
                      모두 준비 완료!
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#FFFFFF'
                    }}>
                      {gameStartCountdown}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <p style={{
                      color: '#FFFFFF',
                      fontSize: '14px',
                      margin: 0,
                      opacity: 0.8
                    }}>
                      {GAME_CONFIG.MAX_PLAYERS - players.length}명 더 필요해요. 친구들을 초대해보세요!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 하단 고정 버튼 */}
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#000000',
              backdropFilter: 'blur(20px)',
              padding: '20px',
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <InviteButton 
                onInvite={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToastMessage('초대 링크가 복사되었습니다!');
                }}
              />
              <LeaveButton onLeave={handleLeaveRoom} />
            </div>

            {/* CSS 애니메이션 */}
            <style jsx>{`
              @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
              }
              
              @keyframes bounceIn {
                0% { transform: scale(0.3) translateY(-50px); opacity: 0; }
                50% { transform: scale(1.1) translateY(-10px); opacity: 0.8; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
              }
              
              @keyframes playerIdle {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
              }
              
              @keyframes waitingPulse {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.02); }
              }
              
              @keyframes sparkle {
                0%, 100% { transform: scale(1) rotate(0deg); }
                50% { transform: scale(1.2) rotate(180deg); }
              }
              
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
              
              @keyframes bounce {
                0% { transform: translateY(0px) rotate(0deg); }
                25% { transform: translateY(-5px) rotate(-25deg); }
                50% { transform: translateY(-11px) rotate(30deg); }
                75% { transform: translateY(-5px) rotate(-20deg); }
                100% { transform: translateY(0px) rotate(0deg); }
              }
              
              @keyframes wiggle {
                0% { transform: translateX(0px) rotate(0deg); }
                20% { transform: translateX(-8px) rotate(-25deg); }
                40% { transform: translateX(8px) rotate(25deg); }
                60% { transform: translateX(-5px) rotate(-20deg); }
                80% { transform: translateX(5px) rotate(20deg); }
                100% { transform: translateX(0px) rotate(0deg); }
              }
            `}</style>
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
          flexDirection: 'column',
          gap: SPACING.md,
          marginBottom: SPACING.md,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <ColorPalette 
            colors={colors}
            currentColor={currentColor}
            onColorChange={setCurrentColor}
          />
          <BrushSizeSelector
            currentSize={brushSize}
            onSizeChange={setBrushSize}
          />
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
        onContextMenu={(e) => e.preventDefault()}
        style={{
          display: gameState === 'playing' ? 'flex' : 'none',
          position: 'relative',
          border: `2px solid ${COLORS.neutral.border}`,
          borderRadius: BORDER_RADIUS.sm,
          cursor: gameState === 'playing' ? 'crosshair' : 'not-allowed',
          background: 'white',
          width: GAME_CONFIG.CANVAS_SIZE.width,
          height: GAME_CONFIG.CANVAS_SIZE.height,
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent'
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
        <div
          ref={cursorsRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 3
          }}
        />
      </div>
    </div>
  );
}