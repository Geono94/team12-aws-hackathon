'use client';

import { useState } from 'react';
import HomePage from '@/components/features/home/HomePage';
import MatchingPage from '@/components/features/matching/MatchingPage';
import DrawingCanvas from '@/components/features/drawing/DrawingCanvas';
import ResultsPage from '@/components/features/results/ResultsPage';
import { useGameState } from '@/hooks/game/useGameState';
import { useWebSocket } from '@/hooks/websocket/useWebSocket';
import { ArtworkItem } from '@/types/ui';
import { GAME_STATES } from '@/constants/game';

// Mock data for development
const mockArtworks: ArtworkItem[] = [
  {
    id: '1',
    originalImage: '/api/placeholder/300/200',
    aiImage: '/api/placeholder/300/200',
    topic: '고양이',
    playerCount: 4,
    createdAt: '2시간 전'
  },
  {
    id: '2',
    originalImage: '/api/placeholder/300/200',
    aiImage: '/api/placeholder/300/200',
    topic: '집',
    playerCount: 3,
    createdAt: '5시간 전'
  }
];

export default function Home() {
  const { gameRoom, currentPlayer, timeLeft, joinGame, resetGame } = useGameState();
  const [currentDrawing, setCurrentDrawing] = useState<string>('');

  // WebSocket connection would be implemented here
  const { sendMessage } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/game',
    onMessage: (message) => {
      // Handle game messages
      console.log('Received message:', message);
    }
  });

  const handleStartGame = () => {
    // Generate random room ID and player
    const roomId = Math.random().toString(36).substring(7);
    const player = {
      id: Math.random().toString(36).substring(7),
      name: `Player ${Math.floor(Math.random() * 1000)}`,
      color: '#FF6B6B',
      isReady: true
    };
    
    joinGame(roomId, player);
  };

  const handlePlayAgain = () => {
    resetGame();
  };

  const handleGoHome = () => {
    resetGame();
  };

  // Render different pages based on game state
  if (!gameRoom) {
    return (
      <HomePage 
        artworks={mockArtworks}
        onStartGame={handleStartGame}
      />
    );
  }

  if (gameRoom.state === GAME_STATES.WAITING) {
    return (
      <MatchingPage
        players={gameRoom.players}
        isHost={gameRoom.players[0]?.id === currentPlayer?.id}
        onStartGame={() => {
          // Start countdown logic
        }}
        onLeaveRoom={resetGame}
      />
    );
  }

  if (gameRoom.state === GAME_STATES.DRAWING) {
    return (
      <DrawingCanvas
        timeLeft={timeLeft}
        topic={gameRoom.topic || 'Unknown'}
        onDrawingChange={setCurrentDrawing}
      />
    );
  }

  if (gameRoom.state === GAME_STATES.RESULTS || gameRoom.state === GAME_STATES.PROCESSING) {
    return (
      <ResultsPage
        originalImage={currentDrawing || '/api/placeholder/400/300'}
        aiImage={gameRoom.aiResult}
        topic={gameRoom.topic || 'Unknown'}
        playerCount={gameRoom.players.length}
        isLoading={gameRoom.state === GAME_STATES.PROCESSING}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    );
  }

  return null;
}
