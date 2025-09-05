import { useEffect, useState } from 'react';
import { useYjs } from '@/contexts/YjsContext';
import { useGameState } from './useGameState';

export function useGameRoom(gameId: string) {
  const { doc, connected } = useYjs();
  const gameState = useGameState(doc);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!doc || !connected || !gameId) return;

    // Initialize game room
    const gameStateMap = doc.getMap('gameState');
    const playersArray = doc.getArray('players');

    if (!gameStateMap.get('id')) {
      gameStateMap.set('id', gameId);
      gameStateMap.set('state', 'waiting');
      gameStateMap.set('topic', null);
      gameStateMap.set('startTime', null);
    }

    // Add player if not already in the game
    const currentPlayers = playersArray.toArray() as string[];
    if (!currentPlayers.includes(playerId) && currentPlayers.length < 4) {
      playersArray.push([playerId]);
    }
  }, [doc, connected, gameId, playerId]);

  const startGame = () => {
    if (!doc) return;
    
    const gameStateMap = doc.getMap('gameState');
    const topics = ['cat', 'house', 'tree', 'car', 'flower', 'sun', 'dog', 'bird'];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    gameStateMap.set('topic', topic);
    gameStateMap.set('state', 'countdown');
    gameStateMap.set('startTime', Date.now());

    setTimeout(() => {
      gameStateMap.set('state', 'playing');
      
      setTimeout(() => {
        gameStateMap.set('state', 'ended');
      }, 30000);
    }, 3000);
  };

  return {
    gameState,
    playerId,
    connected,
    startGame,
  };
}