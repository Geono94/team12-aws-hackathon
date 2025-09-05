'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DrawingCanvas from '@/components/features/drawing/DrawingCanvas';
import { GAME_CONFIG } from '@/constants/game';
import { YjsProvider } from '@/contexts/YjsContext';
import { getRoomInfo, joinRoom } from '@/lib/api/room';

export default function Drawing() {
  const {roomId} = useParams<{ roomId: string}>(); 
  const router = useRouter();
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const [isReady, setIsReady] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);

  useEffect(() => {
    const handleRoomAccess = async () => {
      if (!roomId) {
        router.push('/');
        return;
      }

      // 방이 존재하는지 확인
      const roomInfo = await getRoomInfo(roomId);
      if (!roomInfo) {
        // 방이 없으면 fallback UI 표시
        console.log(`Room ${roomId} not found`);
        setRoomNotFound(true);
        return;
      }

      // 방이 존재하면 바로 입장
      setIsReady(true);
    };

    handleRoomAccess();
  }, [roomId, router]);

  if (roomNotFound) {
    return (
      <div style={{
        background: '#000000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>😕</div>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>
            방을 찾을 수 없습니다
          </h2>
          <p style={{ fontSize: '16px', marginBottom: '32px', opacity: 0.8 }}>
            이 방은 더 이상 존재하지 않거나<br />
            잘못된 링크일 수 있습니다.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              background: '#FF6B6B',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            새 게임 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
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
    <div style={{ 
      padding: '20px',
      background: '#FAFAFA',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <YjsProvider roomId={roomId}>
        <DrawingCanvas
          roomId={roomId}
          playerId={playerId}
        />
      </YjsProvider>
    </div>
  );
}
