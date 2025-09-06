'use client';

import { useState } from 'react';
import { SPACING, BORDER_RADIUS } from '@/constants/design';
import { ArtworkItem } from '@/types/ui';
import ImageSkeleton from '@/components/ui/ImageSkeleton';

interface ArtworkCardProps {
  artwork: ArtworkItem;
  onViewDetail: (artworkId: string) => void;
}

export default function ArtworkCard({ artwork, onViewDetail }: ArtworkCardProps) {
  const [imageError, setImageError] = useState(false);

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
      >
        <ImageSkeleton
          src={displayImage}
          alt={`${artwork.topic} ${imageError ? 'original' : 'AI'} artwork`}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '240px',
            borderRadius: BORDER_RADIUS.lg
          }}
        />

        {/* Topic Badge - Moved to top left */}
        <div style={{
          position: 'absolute',
          top: SPACING.sm,
          left: SPACING.sm,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: `4px ${SPACING.sm}`,
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none'
        }}>
          {artwork.topic}
        </div>

        {/* Time Badge - Bottom right */}
        <div style={{
          position: 'absolute',
          bottom: SPACING.sm,
          right: SPACING.sm,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: `4px ${SPACING.sm}`,
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none'
        }}>
          {artwork.createdAt}
        </div>
      </div>
    </div>
  );
}
