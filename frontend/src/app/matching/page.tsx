'use client';

import { useState } from 'react';
import MatchingPage from '@/components/features/matching/MatchingPage';
import { Player } from '@/types/game';

export default function Matching() {
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
    // Navigate to drawing page
    window.location.href = '/drawing';
  };

  const handleLeaveRoom = () => {
    // Navigate back to home
    window.location.href = '/';
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
