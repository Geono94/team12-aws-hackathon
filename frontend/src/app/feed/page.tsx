'use client';

import { useState, useEffect } from 'react';
import FeedPage from '@/components/features/feed/FeedPage';
import { ArtworkItem } from '@/types/ui';
import { getFinishedRooms } from '@/lib/api/room';
import { getOriginalImageUrl, getAiImageUrl } from '@/lib/utils/s3';

export default function Feed() {
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFinishedRooms();
  }, []);

  const loadFinishedRooms = async () => {
    try {
      console.log('Loading finished rooms...');
      const rooms = await getFinishedRooms();
      console.log('Finished rooms response:', rooms);
      
      const artworkItems: ArtworkItem[] = rooms.map((room) => {
        console.log('Processing room:', room);
        const artwork = {
          id: room.roomId,
          originalImage: getOriginalImageUrl(room.roomId),
          aiImage: getAiImageUrl(room.roomId),
          topic: room.topic || '알 수 없음',
          playerCount: room.playerCount,
          createdAt: formatTimeAgo(room.finishedAt || room.createdAt || Date.now()),
          aiModel: 'Amazon Bedrock',
          reactions: [{ type: 'like', count: Math.floor(Math.random() * 100), userReacted: Math.random() > 0.5 }]
        };
        console.log('Generated artwork item:', artwork);
        return artwork;
      });
      
      console.log('Final artworks array:', artworkItems);
      setArtworks(artworkItems);
    } catch (error) {
      console.error('Failed to load finished rooms:', error);
      setArtworks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  if (isLoading) {
    return (
      <div style={{
        background: '#000000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
          <p>작품 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div style={{
        background: '#000000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
          <p>아직 완료된 작품이 없습니다.</p>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
            게임을 플레이하고 작품을 만들어보세요!
          </p>
        </div>
      </div>
    );
  }

  return <FeedPage artworks={artworks} />;
}
