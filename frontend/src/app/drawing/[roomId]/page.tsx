'use client';

import { useState, useEffect } from 'react';
import DrawingCanvas from '@/components/features/drawing/DrawingCanvas';
import { GAME_CONFIG } from '@/constants/game';
import { YjsProvider } from '@/contexts/YjsContext';
import { useParams } from 'next/navigation';

export default function Drawing() {
  const {roomId} = useParams<{ roomId: string}>(); 
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);

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
