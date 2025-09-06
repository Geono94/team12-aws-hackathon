'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkCard from './ArtworkCard';
import FeedFiltersComponent from './FeedFilters';
import GameInvite from './GameInvite';
import { COLORS, SPACING } from '@/constants/design';
import { ArtworkItem, FeedFilters, Reaction } from '@/types/ui';

interface FeedPageProps {
  artworks: ArtworkItem[];
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}

export default function FeedPage({ artworks: initialArtworks, onLoadMore, isLoadingMore, hasMore }: FeedPageProps) {
  const router = useRouter();
  const [artworks, setArtworks] = useState(initialArtworks);
  const [filters, setFilters] = useState<FeedFilters>({ sortBy: 'latest' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Get available topics for filtering
  const availableTopics = Array.from(new Set(artworks.map(artwork => artwork.topic)));

  // Filter artworks (no sorting needed - backend already sorted)
  const filteredArtworks = artworks.filter(artwork => {
    if (filters.topicFilter && artwork.topic !== filters.topicFilter) return false;
    return true;
  });

  // Pull to refresh functionality
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      
      if (pullDistance > 100 && window.scrollY === 0) {
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${Math.min(pullDistance - 100, 50)}px)`;
          contentRef.current.style.transition = 'none';
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;
      
      const pullDistance = currentY - startY;
      
      if (pullDistance > 100 && window.scrollY === 0) {
        setIsRefreshing(true);
        setTimeout(() => {
          setArtworks(prev => [...prev].sort(() => Math.random() - 0.5));
          setIsRefreshing(false);
        }, 1000);
      }
      
      if (contentRef.current) {
        contentRef.current.style.transform = '';
        contentRef.current.style.transition = 'transform 0.3s ease-out';
      }
      
      isPulling = false;
      startY = 0;
      currentY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleReaction = (artworkId: string, reactionType: Reaction['type']) => {
    setArtworks(prev => prev.map(artwork => {
      if (artwork.id === artworkId) {
        return {
          ...artwork,
          reactions: artwork.reactions.map(reaction => {
            if (reaction.type === reactionType) {
              return {
                ...reaction,
                count: reaction.userReacted ? reaction.count - 1 : reaction.count + 1,
                userReacted: !reaction.userReacted
              };
            }
            return reaction;
          })
        };
      }
      return artwork;
    }));
  };

  const handleViewDetail = (artworkId: string) => {
    router.push(`/feed/${artworkId}`);
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
        hasMore &&
        !isLoadingMore
      ) {
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div style={{ 
      background: '#000000',
      minHeight: '100vh'
    }}>
      {/* Refresh Indicator */}
      {isRefreshing && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: COLORS.primary.main,
          color: 'white',
          padding: `${SPACING.xs} ${SPACING.md}`,
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          새로고침 중...
        </div>
      )}

      <div style={{ padding: SPACING.md }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            position: 'sticky',
            top: 0,
            background: '#000000',
            borderBottom: '1px solid #333333',
            padding: `${SPACING.xs} 0`,
            zIndex: 100,
            margin: `-${SPACING.md} 0 ${SPACING.lg} 0`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Back Button */}
              <button
                onClick={() => router.push('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>

              {/* Title */}
              <div style={{ 
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center'
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: '1.2',
                  display: 'block'
                }}>
                  작품 피드
                </span>
              </div>

              {/* Spacer for layout balance */}
              <div style={{ width: '20px' }}></div>
            </div>
          </div>

          {/* Sticky Filters */}
          <FeedFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            availableTopics={availableTopics}
          />

          {/* Content Area */}
          <div ref={contentRef}>
            {/* Artworks Grid */}
            <div style={{ 
              display: 'grid',
              gap: SPACING.md,
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'
            }}>
              {filteredArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>

            {/* Game Invite - Always show at bottom */}
            <GameInvite />

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div style={{ 
                textAlign: 'center',
                padding: SPACING.lg,
                color: '#888888'
              }}>
                <p>더 많은 작품을 불러오는 중...</p>
              </div>
            )}

            {/* End of Feed Indicator */}
            {!hasMore && artworks.length > 0 && (
              <div style={{ 
                textAlign: 'center',
                padding: SPACING.lg,
                color: '#666666'
              }}>
                <p>모든 작품을 확인했습니다</p>
              </div>
            )}

            {/* Empty State */}
            {filteredArtworks.length === 0 && (
              <div style={{ 
                textAlign: 'center',
                padding: SPACING.xl,
                color: '#888888'
              }}>
                <p style={{ fontSize: '18px', marginBottom: SPACING.sm }}>
                  조건에 맞는 작품이 없습니다
                </p>
                <p>필터를 조정해보세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
