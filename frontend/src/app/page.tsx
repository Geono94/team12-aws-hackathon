'use client';

import HomePage from '@/components/features/home/HomePage';
import { joinRoom } from '@/lib/api/room';

export default function Home() {
  const handleStartGame = async () => {
    try {
      // Get room from API
      const roomData = await joinRoom();
      // Navigate directly to drawing page with room ID
      window.location.href = `/drawing/${roomData.roomId}`;
    } catch (error) {
      console.error('Failed to join room:', error);
      // Fallback to a default room
      const fallbackRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      window.location.href = `/drawing/${fallbackRoomId}`;
    }
  };

  return (
    <HomePage 
      onStartGame={handleStartGame}
    />
  );
}
