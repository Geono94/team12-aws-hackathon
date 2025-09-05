'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MatchingPage from '@/components/features/matching/MatchingPage';
import { Player } from '@/types/game';

export default function Matching() {
  const router = useRouter();
  const [players] = useState<Player[]>([
    {
      id: '1',
      name: 'Player 1',
      color: '#FF6B6B',
      isReady: true
    },
    {
      id: '2', 
      name: 'Player 2',
      color: '#4ECDC4',
      isReady: true
    }
  ]);

  const handleStartGame = () => {
    // Generate room ID and navigate to topic selection
    const roomId = Math.random().toString(36).substring(2, 8);
    router.push(`/topic-selection/${roomId}`);
  };

  const handleLeaveRoom = () => {
    // Navigate back to home
    router.push('/');
  };

  return (
    <MatchingPage
      players={players}
      isHost={true}
      onStartGame={handleStartGame}
      onLeaveRoom={handleLeaveRoom}
    />
  );
}
