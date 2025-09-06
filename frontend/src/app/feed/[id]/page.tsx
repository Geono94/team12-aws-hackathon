'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkDetailPage from '@/components/features/feed/ArtworkDetailPage';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { ArtworkItem } from '@/types/ui';
import { getRoomInfo } from '@/lib/api/room';
import { createArtworkFromRoom } from '@/lib/utils/artwork';

export default async function ArtworkDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <ArtworkDetailClient roomId={id} />;
}

function ArtworkDetailClient({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [artwork, setArtwork] = useState<ArtworkItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArtwork();
  }, []);

  const loadArtwork = async () => {
    try {
      const room = await getRoomInfo(roomId);
      
      if (room && room.status === 'finished') {
        const artworkItem = createArtworkFromRoom(room);
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
