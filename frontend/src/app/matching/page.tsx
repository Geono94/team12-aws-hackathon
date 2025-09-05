'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MatchingPage from '@/components/features/matching/MatchingPage';
import { Player } from '@/types/game';
import { joinRoom, leaveRoom } from '@/lib/api/room';

export default function Matching() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [playerId] = useState<string>(`player_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 자동으로 룸 참가
    handleJoinRoom();
  }, []);

  const handleJoinRoom = async () => {
    try {
      setIsLoading(true);
      const roomData = await joinRoom();
      setRoomId(roomData.roomId);
      
      // 첫 번째 플레이어면 호스트
      setIsHost(roomData.playerCount === 1);
      
      // 플레이어 목록 업데이트 (실제로는 WebSocket으로 실시간 업데이트)
      const mockPlayers: Player[] = Array.from({ length: roomData.playerCount }, (_, i) => ({
        id: `player_${i + 1}`,
        name: `플레이어 ${i + 1}`,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i],
        isReady: true
      }));
      
      setPlayers(mockPlayers);
      
      // 1초 후 바로 드로잉 페이지로 이동
      setTimeout(() => {
        router.push(`/drawing/${roomData.roomId}`);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to join room:', error);
      // 에러 시 홈으로 돌아가기
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    if (roomId && players.length >= 2) {
      router.push(`/drawing/${roomId}`);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      if (roomId) {
        await leaveRoom(roomId, playerId);
      }
    } catch (error) {
      console.error('Failed to leave room:', error);
    } finally {
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        background: '#000000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
          <p>게임 준비 중...</p>
        </div>
      </div>
    );
  }

  return (
    <MatchingPage
      players={players}
      isHost={isHost}
      onStartGame={handleStartGame}
      onLeaveRoom={handleLeaveRoom}
    />
  );
}
