'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FeedPage from '@/components/features/feed/FeedPage';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { ArtworkItem } from '@/types/ui';
import { getFinishedRooms } from '@/lib/api/room';
import { getOriginalImageUrl, getAiImageUrl } from '@/lib/utils/s3';

export default function Feed() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('작품을 불러오는 중 오류가 발생했습니다.');
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
      <EmptyState
        title="작품 로딩 중..."
        description="잠시만 기다려주세요"
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="로딩 오류"
        description={error}
        action={
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            size="md"
          >
            다시 시도
          </Button>
        }
      />
    );
  }

  if (artworks.length === 0) {
    return (
      <EmptyState
        title="아직 완료된 작품이 없습니다"
        description="게임을 플레이하고 작품을 만들어보세요!"
        action={
          <Button
            onClick={() => router.push('/')}
            variant="primary"
            size="medium"
          >
            게임 시작하기
          </Button>
        }
      />
    );
  }

  return <FeedPage artworks={artworks} />;
}
