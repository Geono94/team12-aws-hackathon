'use client';

import { useState, useEffect, useRef } from 'react';
import ArtworkCard from './ArtworkCard';
import FeedFiltersComponent from './FeedFilters';
import ArtworkDetailModal from './ArtworkDetailModal';
import { COLORS, SPACING } from '@/constants/design';
import { ArtworkItem, FeedFilters, Reaction } from '@/types/ui';

interface FeedPageProps {
  artworks: ArtworkItem[];
}

export default function FeedPage({ artworks: initialArtworks }: FeedPageProps) {
  const [artworks, setArtworks] = useState(initialArtworks);
  const [filters, setFilters] = useState<FeedFilters>({ sortBy: 'latest' });
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Get available topics for filtering
  const availableTopics = Array.from(new Set(artworks.map(artwork => artwork.topic)));

  // Filter and sort artworks
  const filteredArtworks = artworks
    .filter(artwork => {
      if (filters.topicFilter && artwork.topic !== filters.topicFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'popular') {
        const aTotal = a.reactions.reduce((sum, r) => sum + r.count, 0);
        const bTotal = b.reactions.reduce((sum, r) => sum + r.count, 0);
        return bTotal - aTotal;
      }
      // Default to latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Pull to refresh functionality - only for content area
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
        // Only transform the content area, not the sticky header
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
        // Trigger refresh
        setIsRefreshing(true);
        
        // Simulate refresh
        setTimeout(() => {
          setArtworks(prev => [...prev].sort(() => Math.random() - 0.5));
          setIsRefreshing(false);
        }, 1000);
      }
      
      // Reset transform
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
    const artwork = artworks.find(a => a.id === artworkId);
    if (artwork) {
      setSelectedArtwork(artwork);
      setIsModalOpen(true);
    }
  };

  const handleShare = (artworkId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'DrawTogether 작품',
        text: `${selectedArtwork?.topic} 주제로 ${selectedArtwork?.playerCount}명이 함께 그린 작품을 확인해보세요!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        console.log('Loading more artworks...');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ 
      background: COLORS.neutral.background,
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
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: 'bold',
            color: COLORS.neutral.text,
            marginBottom: SPACING.lg,
            textAlign: 'center'
          }}>
            작품 피드
          </h1>

          {/* Sticky Filters */}
          <FeedFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            availableTopics={availableTopics}
          />

          {/* Content Area - Only this part moves during pull-to-refresh */}
          <div ref={contentRef}>
            {/* Results Count */}
            <p style={{ 
              fontSize: '16px',
              color: COLORS.neutral.subtext,
              marginBottom: SPACING.md,
              textAlign: 'center'
            }}>
              {filteredArtworks.length}개의 작품
            </p>
            
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
                  onReaction={handleReaction}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredArtworks.length === 0 && (
              <div style={{ 
                textAlign: 'center',
                padding: SPACING.xl,
                color: COLORS.neutral.subtext
              }}>
                <p style={{ fontSize: '18px', marginBottom: SPACING.sm }}>
                  조건에 맞는 작품이 없습니다
                </p>
                <p>필터를 조정해보세요</p>
              </div>
            )}
          </div>

          {/* Detail Modal */}
          {selectedArtwork && (
            <ArtworkDetailModal
              artwork={selectedArtwork}
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedArtwork(null);
              }}
              onReaction={handleReaction}
              onShare={handleShare}
            />
          )}
        </div>
      </div>
    </div>
  );
}
