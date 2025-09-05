'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkDetailPage from '@/components/features/feed/ArtworkDetailPage';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { ArtworkItem } from '@/types/ui';
import { getRoomInfo } from '@/lib/api/room';
import { getOriginalImageUrl, getAiImageUrl } from '@/lib/utils/s3';

export default function ArtworkDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [artwork, setArtwork] = useState<ArtworkItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArtwork();
  }, []);

  const loadArtwork = async () => {
    try {
      const roomId = params.id;
      const room = await getRoomInfo(roomId);
      
      if (room && room.status === 'finished') {
        const artworkItem: ArtworkItem = {
          id: room.roomId,
          originalImage: getOriginalImageUrl(room.roomId),
          aiImage: getAiImageUrl(room.roomId),
          topic: room.topic || '알 수 없음',
          playerCount: room.playerCount,
          createdAt: formatTimeAgo(room.finishedAt || room.createdAt || Date.now()),
          aiModel: 'Amazon Bedrock',
          reactions: [{ type: 'like', count: Math.floor(Math.random() * 100), userReacted: Math.random() > 0.5 }]
        };
        setArtwork(artworkItem);
      } else {
        setError('작품을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to load artwork:', error);
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

  if (error || !artwork) {
    return (
      <EmptyState
        icon="😞"
        title={error || '작품을 찾을 수 없습니다'}
        description="다른 작품을 확인해보세요"
        action={
          <Button
            onClick={() => router.push('/')}
            variant="primary"
            size="md"
          >
            돌아가기
          </Button>
        }
      />
    );
  }

  return <ArtworkDetailPage artwork={artwork} />;
}
