'use client';

import { useState } from 'react';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { ArtworkItem } from '@/types/ui';
import { getUserReaction } from '@/lib/utils/artwork';
import ImageSkeleton from '@/components/ui/ImageSkeleton';

interface ArtworkCardProps {
  artwork: ArtworkItem;
  onReaction: (artworkId: string, reactionType: 'like') => void;
  onViewDetail: (artworkId: string) => void;
}

export default function ArtworkCard({ artwork, onReaction, onViewDetail }: ArtworkCardProps) {
  const [imageError, setImageError] = useState(false);
  const likeReaction = getUserReaction(artwork, 'like');
  const isLiked = likeReaction?.userReacted || false;
  const likeCount = likeReaction?.count || 0;

  const handleDoubleClick = () => {
    onReaction(artwork.id, 'like');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Use original image if AI image fails to load
  const displayImage = imageError ? artwork.originalImage : artwork.aiImage;

  return (
    <div 
      style={{
        background: '#1a1a1a',
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(255,255,255,0.1)',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
        cursor: 'pointer'
      }}
      onClick={() => onViewDetail(artwork.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(255,255,255,0.1)';
      }}
    >
      
      {/* AI Image */}
      <div 
        style={{ position: 'relative' }}
        onDoubleClick={handleDoubleClick}
      >
        <ImageSkeleton
          src={displayImage}
          alt={`${artwork.topic} ${imageError ? 'original' : 'AI'} artwork`}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '240px',
            borderRadius: `${BORDER_RADIUS.lg} ${BORDER_RADIUS.lg} 0 0`
          }}
        />

        {/* AI Model Tag - Semi-transparent overlay */}
        <div style={{
          position: 'absolute',
          top: SPACING.sm,
          left: SPACING.sm,
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: `4px ${SPACING.sm}`,
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none'
        }}>
          {imageError ? '원본' : artwork.aiModel || 'AI'}
        </div>

        {/* Topic Badge */}
        <div style={{
          position: 'absolute',
          bottom: SPACING.sm,
          right: SPACING.sm,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: `4px ${SPACING.sm}`,
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none'
        }}>
          #{artwork.topic}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: `${SPACING.sm} ${SPACING.md}` }}>
        {/* Action Buttons and Creation Date */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.sm
          }}>
            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReaction(artwork.id, 'like');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px',
                border: 'none',
                background: 'transparent',
                color: isLiked ? COLORS.primary.main : '#888888',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease-out'
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{likeCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(artwork.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px',
                border: 'none',
                background: 'transparent',
                color: '#888888',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'color 0.2s ease-out'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>12</span>
            </button>

            {/* View Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#888888',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>156</span>
            </div>
          </div>

          {/* Creation Date */}
          <div style={{ 
            fontSize: '11px',
            color: '#666666'
          }}>
            {artwork.createdAt}
          </div>
        </div>
      </div>
    </div>
  );
}
