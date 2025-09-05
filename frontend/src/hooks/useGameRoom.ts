import { useEffect, useState } from 'react';
import { useYjs } from '@/contexts/YjsContext';
import { useGameState } from './useGameState';

export function useGameRoom(gameId: string) {
  const { doc, connected } = useYjs();
  const gameState = useGameState(doc);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!doc || !connected || !gameId || isInitialized) return;

    console.log('Initializing game room:', gameId, 'Player:', playerId);

    // Initialize game room
    const gameStateMap = doc.getMap('gameState');
    const playersArray = doc.getArray('players');
    const drawingArray = doc.getArray('drawing');

    // Initialize game state if not exists
    if (!gameStateMap.get('id')) {
      console.log('Creating new game state');
      gameStateMap.set('id', gameId);
      gameStateMap.set('state', 'waiting');
      gameStateMap.set('topic', null);
      gameStateMap.set('startTime', null);
    }

    // Add player if not already in the game
    const currentPlayers = playersArray.toArray() as string[];
    if (!currentPlayers.includes(playerId) && currentPlayers.length < 4) {
      console.log('Adding player to game:', playerId);
      playersArray.push([playerId]);
    }

    // Initialize drawing array if empty
    if (drawingArray.length === 0) {
      console.log('Initializing drawing array');
    }

    setIsInitialized(true);
  }, [doc, connected, gameId, playerId, isInitialized]);

  const startGame = () => {
    if (!doc) return;
    
    console.log('Starting game...');
    const gameStateMap = doc.getMap('gameState');
    const topics = ['cat', 'house', 'tree', 'car', 'flower', 'sun', 'dog', 'bird'];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    gameStateMap.set('topic', topic);
    gameStateMap.set('state', 'countdown');
    gameStateMap.set('startTime', Date.now());

    setTimeout(() => {
      console.log('Game started - playing phase');
      gameStateMap.set('state', 'playing');
      
      setTimeout(() => {
        console.log('Game ended');
        gameStateMap.set('state', 'ended');
      }, 30000);
    }, 3000);
  };

  const clearDrawing = () => {
    if (!doc) return;
    const drawingArray = doc.getArray('drawing');
    drawingArray.delete(0, drawingArray.length);
  };

  return {
    gameState,
    playerId,
    connected,
    isInitialized,
    startGame,
    clearDrawing,
  };
}