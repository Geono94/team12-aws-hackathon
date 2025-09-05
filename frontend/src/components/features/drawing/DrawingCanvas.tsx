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
import NewCanvas from './NewCanvas';

interface DrawingCanvasProps {
  roomId: string;
}

export default function DrawingCanvas({ roomId }: DrawingCanvasProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameStateType>('waiting');
  const [topic, setTopic] = useState<string>('고양이');
  const [countdown, setCountdown] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

  const { doc, connected, onMessage, sendMessage } = useYjs();

  // 나가기 함수
  const handleLeaveRoom = async () => {
    try {
      // 백엔드에 룸 나가기 API 호출
      const playerId = getPlayer().id;
      await leaveRoom(roomId, playerId);
      
      // 홈페이지로 이동
      router.push('/');
    } catch (error) {
      console.error('Error leaving room:', error);
      // 에러가 발생해도 홈페이지로 이동
      router.push('/');
    }
  };

  useEffect(() => {
    const player = getPlayer();
    if (!player) {
      return;
    }

    sendMessage({
      type: 'joinRoom',
      data: {
        roomId,
        playerId : player.id,
        playerName: player.name,
      }
    })
  }, [])
 

  // Sync local state with server messages
  useEffect(() => {
    return onMessage((message: ServerToClientMessage) => { 
      if (message.type === 'gameStateUpdate') {
        const data = message.data;
        console.log('gameStateUpdate received:', data); // 디버그 로그 추가
        if (data.state) setGameState(data.state);
        if (data.topic) {
          console.log('topic', data.topic)
          setTopic(data.topic);
        }
        if (data.countdown !== undefined) setCountdown(data.countdown);
        if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
        
        // gameStateUpdate에 players 정보가 있으면 업데이트
        if (data.players && Array.isArray(data.players)) {
          console.log('Players from gameStateUpdate:', data.players);
          setPlayers(data.players);
          setPlayerCount(data.players.length);
        }
      } else if (message.type === 'playerUpdate') {
        const newPlayerCount = message.data.playerCount;
        setPlayerCount(newPlayerCount);
        
        // playerCount에 따라 플레이어 목록 생성
        const updatedPlayers: PlayerInfo[] = Array.from({ length: newPlayerCount }, (_, index) => ({
          id: `player_${index + 1}`,
          name: `플레이어 ${index + 1}`,
          joinedAt: Date.now().toString()
        }));
        setPlayers(updatedPlayers);
      } else if (message.type === 'roomJoined') {
        console.log('roomJoined received:', message.data);
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
            <div style={{ 
                  background: '#000000',
                  minHeight: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: SPACING.lg
                }}>
                  {/* Header */}
                  <div style={{ 
                    textAlign: 'center',
                    marginBottom: SPACING.xl
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: SPACING.sm
                    }}>
                      🎮
                    </div>
                    <h1 style={{ 
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                      marginBottom: SPACING.sm
                    }}>
                      대기실
                    </h1>
                  </div>

                  {/* Main Card */}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: SPACING.xl,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    minWidth: '400px',
                    maxWidth: '500px'
                  }}>
                    {/* Player Count */}
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

                    {/* Players Grid */}
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

                    {/* Action Buttons */}
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
          <TopicSelection
            selectedTopic={topic}
          />
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
 
      <NewCanvas
        roomId={roomId}
        playerId={getPlayer()?.id!}
        gameState={gameState}
        disabled={!connected || !doc}
      /> 
    </div>
  );
}
