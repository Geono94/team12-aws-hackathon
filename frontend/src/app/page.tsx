'use client';

import { useState } from 'react';
import HomePage from '@/components/features/home/HomePage';
import { clearPlayer, savePlayer } from '@/lib/player';
import { ArtworkItem } from '@/types/ui';

// Sample artworks for feed section
const S3_BUCKET_URL = 'https://drawtogether-test-1757052413482.s3.amazonaws.com';

const mockArtworks: ArtworkItem[] = [
  {
    id: '1',
    originalImage: `${S3_BUCKET_URL}/images/original1.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai1.svg`,
    topic: '고양이',
    playerCount: 4,
    createdAt: '2시간 전',
    aiModel: 'Stable Diffusion v2.1',
    reactions: [{ type: 'like', count: 24, userReacted: false }]
  },
  {
    id: '2',
    originalImage: `${S3_BUCKET_URL}/images/original2.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai2.svg`,
    topic: '집',
    playerCount: 3,
    createdAt: '5시간 전',
    aiModel: 'DALL-E 3',
    reactions: [{ type: 'like', count: 18, userReacted: true }]
  },
  {
    id: '3',
    originalImage: `${S3_BUCKET_URL}/images/original1.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai2.svg`,
    topic: '나무',
    playerCount: 2,
    createdAt: '1일 전',
    aiModel: 'Midjourney v6',
    reactions: [{ type: 'like', count: 42, userReacted: false }]
  },
  {
    id: '4',
    originalImage: `${S3_BUCKET_URL}/images/original2.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai1.svg`,
    topic: '자동차',
    playerCount: 4,
    createdAt: '1일 전',
    aiModel: 'Stable Diffusion XL',
    reactions: [{ type: 'like', count: 31, userReacted: true }]
  }
];

export default function Home() {
  const [isJoining, setIsJoining] = useState(false);

  const handleStartGame = async (playerName: string) => {
    if (isJoining) return;
    
    try {
      setIsJoining(true);
      
      // Clear any existing player data
      clearPlayer();
      
      // Save new player info
      const player = savePlayer(playerName);
      
      // Connect to WebSocket and request room join
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}` 
        : `ws://${window.location.hostname}:3001`;
        
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected, requesting room join...');
        ws.send(JSON.stringify({
          type: 'joinRoom',
          data: {
            playerId: player.id,
            playerName: player.name
          }
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'roomJoined') {
            console.log('Room joined:', message.data);
            ws.close();
            // Redirect to drawing page
            window.location.href = `/drawing/${message.data.roomId}`;
          } else if (message.type === 'error') {
            console.error('Room join error:', message.message);
            alert('게임 참가에 실패했습니다: ' + message.message);
            setIsJoining(false);
          }
        } catch (error) {
          console.error('Message parsing error:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('연결에 실패했습니다. 다시 시도해주세요.');
        setIsJoining(false);
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        if (isJoining) {
          setIsJoining(false);
        }
      };
      
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('게임 시작에 실패했습니다. 다시 시도해주세요.');
      setIsJoining(false);
    }
  };

  return (
    <HomePage 
      onStartGame={handleStartGame}
      isLoading={isJoining}
      artworks={mockArtworks}
    />
  );
}
