'use client';

import { useState } from 'react';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { ArtworkItem } from '@/types/ui';

interface ArtworkCardProps {
  artwork: ArtworkItem;
  onReaction: (artworkId: string, reactionType: 'like') => void;
  onViewDetail: (artworkId: string) => void;
}

export default function ArtworkCard({ artwork, onReaction, onViewDetail }: ArtworkCardProps) {
  const [viewMode, setViewMode] = useState<'original' | 'ai'>('original');
  
  const likeReaction = artwork.reactions.find(r => r.type === 'like');
  const isLiked = likeReaction?.userReacted || false;
  const likeCount = likeReaction?.count || 0;

  const handleDoubleClick = () => {
    onReaction(artwork.id, 'like');
  };

  return (
    <div style={{
      background: COLORS.neutral.card,
      borderRadius: BORDER_RADIUS.lg,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}>
      
      {/* Image Container */}
      <div style={{ 
        position: 'relative',
        aspectRatio: '1',
        overflow: 'hidden'
      }}>
        <img
          src={viewMode === 'original' ? artwork.originalImage : artwork.aiImage}
          alt={viewMode === 'original' ? 'Original artwork' : 'AI generated artwork'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease-out'
          }}
          onDoubleClick={handleDoubleClick}
          onClick={() => onViewDetail(artwork.id)}
        />
        
        {/* View Mode Toggle */}
        <div style={{
          position: 'absolute',
          top: SPACING.sm,
          right: SPACING.sm,
          display: 'flex',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '20px',
          padding: '4px',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('original');
            }}
            style={{
              padding: `4px ${SPACING.sm}`,
              borderRadius: '16px',
              border: 'none',
              background: viewMode === 'original' ? 'rgba(255,255,255,0.9)' : 'transparent',
              color: viewMode === 'original' ? COLORS.neutral.text : 'white',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease-out'
            }}
          >
            원본
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('ai');
            }}
            style={{
              padding: `4px ${SPACING.sm}`,
              borderRadius: '16px',
              border: 'none',
              background: viewMode === 'ai' ? 'rgba(255,255,255,0.9)' : 'transparent',
              color: viewMode === 'ai' ? COLORS.neutral.text : 'white',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease-out'
            }}
          >
            AI
          </button>
        </div>

        {/* Topic Badge */}
        <div style={{
          position: 'absolute',
          bottom: SPACING.sm,
          left: SPACING.sm,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: `4px ${SPACING.sm}`,
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          backdropFilter: 'blur(10px)'
        }}>
          #{artwork.topic}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: SPACING.md }}>
        {/* Meta Info */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.sm
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.xs,
            fontSize: '13px',
            color: COLORS.neutral.subtext
          }}>
            <span>{artwork.playerCount}명 참여</span>
            <span>•</span>
            <span>{artwork.createdAt}</span>
          </div>
          
          {artwork.aiModel && (
            <span style={{ 
              fontSize: '11px',
              color: COLORS.neutral.subtext,
              background: COLORS.neutral.background,
              padding: '2px 6px',
              borderRadius: '8px'
            }}>
              {artwork.aiModel}
            </span>
          )}
        </div>

        {/* Like Button */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReaction(artwork.id, 'like');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACING.xs,
              padding: `${SPACING.xs} ${SPACING.sm}`,
              borderRadius: '20px',
              border: 'none',
              background: isLiked ? 'rgba(255, 107, 107, 0.1)' : 'transparent',
              color: isLiked ? COLORS.primary.main : COLORS.neutral.subtext,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease-out'
            }}
            onMouseEnter={(e) => {
              if (!isLiked) {
                e.currentTarget.style.background = 'rgba(255, 107, 107, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLiked) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={{ 
              fontSize: '16px',
              transform: isLiked ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s ease-out'
            }}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span>{likeCount}</span>
          </button>

          {/* View Detail Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(artwork.id);
            }}
            style={{
              padding: `${SPACING.xs} ${SPACING.sm}`,
              borderRadius: '16px',
              border: 'none',
              background: COLORS.neutral.background,
              color: COLORS.neutral.subtext,
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease-out'
            }}
          >
            자세히 보기
          </button>
        </div>
      </div>
    </div>
  );
}
