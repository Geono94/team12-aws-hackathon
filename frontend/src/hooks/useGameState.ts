import { useEffect, useState } from 'react';
import * as Y from 'yjs';

export interface GameState {
  id: string;
  state: 'waiting' | 'countdown' | 'playing' | 'ended';
  topic: string | null;
  startTime: number | null;
  players: string[];
}

export function useGameState(ydoc: Y.Doc | null) {
  const [gameState, setGameState] = useState<GameState>({
    id: '',
    state: 'waiting',
    topic: null,
    startTime: null,
    players: [],
  });

  useEffect(() => {
    if (!ydoc) return;

    const gameStateMap = ydoc.getMap('gameState');
    const playersArray = ydoc.getArray('players');

    const updateGameState = () => {
      setGameState({
        id: gameStateMap.get('id') || '',
        state: gameStateMap.get('state') || 'waiting',
        topic: gameStateMap.get('topic') || null,
        startTime: gameStateMap.get('startTime') || null,
        players: playersArray.toArray() as string[],
      });
    };

    gameStateMap.observe(updateGameState);
    playersArray.observe(updateGameState);
    updateGameState();

    return () => {
      gameStateMap.unobserve(updateGameState);
      playersArray.unobserve(updateGameState);
    };
  }, [ydoc]);

  return gameState;
}