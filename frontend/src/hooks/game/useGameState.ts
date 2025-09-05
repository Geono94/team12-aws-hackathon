'use client';

import { useState, useCallback } from 'react';
import { GameRoom, Player } from '@/types/game';
import { GAME_STATES } from '@/constants/game';

export function useGameState() {
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const joinGame = useCallback((roomId: string, player: Player) => {
    setCurrentPlayer(player);
    setGameRoom({
      id: roomId,
      players: [player],
      state: GAME_STATES.WAITING,
    });
  }, []);

  const updateGameRoom = useCallback((updates: Partial<GameRoom>) => {
    setGameRoom(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const addPlayer = useCallback((player: Player) => {
    setGameRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        players: [...prev.players, player]
      };
    });
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setGameRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        players: prev.players.filter(p => p.id !== playerId)
      };
    });
  }, []);

  const startCountdown = useCallback((topic: string) => {
    setGameRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        state: GAME_STATES.COUNTDOWN,
        topic,
        startTime: Date.now()
      };
    });
  }, []);

  const startDrawing = useCallback(() => {
    setGameRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        state: GAME_STATES.DRAWING
      };
    });
  }, []);

  const endGame = useCallback((canvasData: string) => {
    setGameRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        state: GAME_STATES.PROCESSING,
        canvasData
      };
    });
  }, []);

  const showResults = useCallback((aiResult: string) => {
    setGameRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        state: GAME_STATES.RESULTS,
        aiResult
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameRoom(null);
    setCurrentPlayer(null);
    setTimeLeft(0);
  }, []);

  return {
    gameRoom,
    currentPlayer,
    timeLeft,
    setTimeLeft,
    joinGame,
    updateGameRoom,
    addPlayer,
    removePlayer,
    startCountdown,
    startDrawing,
    endGame,
    showResults,
    resetGame,
  };
}
