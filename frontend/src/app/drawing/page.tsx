'use client';

import { useState, useEffect } from 'react';
import DrawingCanvas from '@/components/features/drawing/DrawingCanvas';
import { GAME_CONFIG } from '@/constants/game';

export default function Drawing() {
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.DRAWING_TIME);
 
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          // Navigate to results when time is up
          window.location.href = '/results';
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      padding: '20px',
      background: '#FAFAFA',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <DrawingCanvas
        roomId="mockRoomId"
        playerId="1234"
      />
    </div>
  );
}
