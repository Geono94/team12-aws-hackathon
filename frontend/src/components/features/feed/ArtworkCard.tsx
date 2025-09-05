'use client';

import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { ArtworkItem } from '@/types/ui';

interface ArtworkCardProps {
  artwork: ArtworkItem;
  onReaction: (artworkId: string, reactionType: 'like') => void;
  onViewDetail: (artworkId: string) => void;
}

export default function ArtworkCard({ artwork, onReaction, onViewDetail }: ArtworkCardProps) {
  const likeReaction = artwork.reactions.find(r => r.type === 'like');
  const isLiked = likeReaction?.userReacted || false;
  const likeCount = likeReaction?.count || 0;

  const handleDoubleClick = () => {
    onReaction(artwork.id, 'like');
  };

  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: BORDER_RADIUS.lg,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(255,255,255,0.1)',
      transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(255,255,255,0.1)';
    }}>
      
      {/* AI Image Only */}
      <div 
        style={{ position: 'relative' }}
        onDoubleClick={handleDoubleClick}
        onClick={() => onViewDetail(artwork.id)}
      >
        <img
          src={artwork.aiImage}
          alt={`${artwork.topic} AI artwork`}
          style={{
            width: '100%',
            height: '240px',
            objectFit: 'cover',
            display: 'block'
          }}
        />

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
            color: '#888888'
          }}>
            <span>{artwork.playerCount}명 참여</span>
            <span>•</span>
            <span>{artwork.createdAt}</span>
          </div>
          
          {artwork.aiModel && (
            <span style={{ 
              fontSize: '11px',
              color: '#888888',
              background: '#2a2a2a',
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
              color: isLiked ? COLORS.primary.main : '#888888',
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
              background: '#2a2a2a',
              color: '#888888',
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
