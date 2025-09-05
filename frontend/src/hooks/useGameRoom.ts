import { useEffect, useState } from 'react';
import { useYjs } from '@/contexts/YjsContext';

export function useGameRoom(roomId: string) {
  const { doc, connected, onMessage } = useYjs();
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!connected || !roomId || isInitialized) return;

    console.log('Initializing game room:', roomId, 'Player:', playerId);
    setIsInitialized(true);
  }, [connected, roomId, playerId, isInitialized]);

  useEffect(() => {
    if (!connected) return;
    
    return onMessage((message: any) => {
      console.log('Received message:', message);
      // Handle incoming messages if needed
    });
  }, [connected, onMessage]);

  const clearDrawing = () => {
    if (!doc) return;
    const drawingArray = doc.getArray('drawing');
    drawingArray.delete(0, drawingArray.length);
  };

  return {
    playerId,
    connected,
    isInitialized,
    clearDrawing,
  };
}