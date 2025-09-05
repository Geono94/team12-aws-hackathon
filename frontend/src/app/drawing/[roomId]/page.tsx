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
  const [isReady, setIsReady] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

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

      // 방이 이미 종료되었는지 확인
      if (roomInfo.status === 'finished') {
        console.log(`Room ${roomId} is already finished, redirecting to results`);
        setIsFinished(true);
        // 3초 후 결과 페이지로 이동
        setTimeout(() => {
          router.push(`/results?roomId=${roomId}`);
        }, 3000);
        return;
      }

      // 방이 존재하고 진행 중이면 바로 입장
      setIsReady(true);
    };

    handleRoomAccess();
  }, [roomId, router]);

  if (isFinished) {
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
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎨</div>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>
            게임이 이미 종료되었습니다
          </h2>
          <p style={{ fontSize: '16px', marginBottom: '32px', opacity: 0.8 }}>
            이 방의 게임은 이미 끝났습니다.<br />
            잠시 후 결과 페이지로 이동합니다...
          </p>
          <div style={{
            width: '200px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: '#FF6B6B',
              borderRadius: '2px',
              animation: 'progress 3s linear forwards'
            }} />
          </div>
          <style jsx>{`
            @keyframes progress {
              from { transform: translateX(-100%); }
              to { transform: translateX(0%); }
            }
          `}</style>
        </div>
      </div>
    );
  }

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
        />
      </YjsProvider>
    </div>
  );
}
