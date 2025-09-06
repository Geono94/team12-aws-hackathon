'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FeedPage from '@/components/features/feed/FeedPage';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { ArtworkItem } from '@/types/ui';
import { getFinishedRooms } from '@/lib/api/room';
import { createArtworkFromRoom } from '@/lib/utils/artwork';

export default function Feed() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();

  useEffect(() => {
    loadFinishedRooms();
  }, []);

  const loadFinishedRooms = async (reset = true) => {
    try {
      if (reset) {
        setIsLoading(true);
        setCursor(undefined);
      } else {
        setIsLoadingMore(true);
      }

      const response = await getFinishedRooms(10, reset ? undefined : cursor);
      
      const artworkItems: ArtworkItem[] = response.rooms.map(createArtworkFromRoom);
      
      if (reset) {
        setArtworks(artworkItems);
      } else {
        setArtworks(prev => [...prev, ...artworkItems]);
      }
      
      setHasMore(response.hasMore);
      setCursor(response.cursor);
    } catch (error) {
      console.error('Failed to load finished rooms:', error);
      setError('작품을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadFinishedRooms(false);
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
            size="md"
          >
            게임 시작하기
          </Button>
        }
      />
    );
  }

  return (
    <FeedPage 
      artworks={artworks} 
      onLoadMore={loadMore}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
    />
  );
}
