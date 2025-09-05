'use client';

import Button from '@/components/ui/Button';
import ReactionButton from '@/components/ui/ReactionButton';
import ImageCompareSlider from '@/components/ui/ImageCompareSlider';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { ArtworkItem, Reaction } from '@/types/ui';

interface ArtworkDetailModalProps {
  artwork: ArtworkItem;
  isOpen: boolean;
  onClose: () => void;
  onReaction: (artworkId: string, reactionType: Reaction['type']) => void;
  onShare: (artworkId: string) => void;
}

export default function ArtworkDetailModal({ 
  artwork, 
  isOpen, 
  onClose, 
  onReaction, 
  onShare 
}: ArtworkDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: SPACING.md
    }}>
      <div style={{
        background: COLORS.neutral.card,
        borderRadius: BORDER_RADIUS.lg,
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: SPACING.md,
            right: SPACING.md,
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontSize: '18px',
            zIndex: 1001
          }}
        >
          ×
        </button>

        <div style={{ padding: SPACING.lg }}>
          {/* Image Compare Slider */}
          <div style={{ 
            position: 'relative',
            marginBottom: SPACING.lg
          }}>
            <ImageCompareSlider
              originalImage={artwork.originalImage}
              aiImage={artwork.aiImage}
              alt={`${artwork.topic} artwork comparison`}
            />
            
            {/* Instruction Text */}
            <div style={{
              position: 'absolute',
              bottom: SPACING.md,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: `${SPACING.xs} ${SPACING.md}`,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              pointerEvents: 'none'
            }}>
              드래그해서 원본과 AI 결과를 비교해보세요
            </div>
          </div>

          {/* Artwork Info */}
          <div style={{ marginBottom: SPACING.lg }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: COLORS.neutral.text,
              marginBottom: SPACING.sm
            }}>
              주제: {artwork.topic}
            </h2>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: SPACING.md,
              marginBottom: SPACING.md
            }}>
              <div>
                <p style={{ 
                  fontSize: '14px',
                  color: COLORS.neutral.subtext,
                  marginBottom: '4px'
                }}>
                  참여자 수
                </p>
                <p style={{ 
                  fontSize: '18px',
                  fontWeight: '600',
                  color: COLORS.neutral.text
                }}>
                  {artwork.playerCount}명
                </p>
              </div>
              
              <div>
                <p style={{ 
                  fontSize: '14px',
                  color: COLORS.neutral.subtext,
                  marginBottom: '4px'
                }}>
                  소요 시간
                </p>
                <p style={{ 
                  fontSize: '18px',
                  fontWeight: '600',
                  color: COLORS.neutral.text
                }}>
                  30초
                </p>
              </div>
              
              <div>
                <p style={{ 
                  fontSize: '14px',
                  color: COLORS.neutral.subtext,
                  marginBottom: '4px'
                }}>
                  생성 시간
                </p>
                <p style={{ 
                  fontSize: '18px',
                  fontWeight: '600',
                  color: COLORS.neutral.text
                }}>
                  {artwork.createdAt}
                </p>
              </div>
              
              {artwork.aiModel && (
                <div>
                  <p style={{ 
                    fontSize: '14px',
                    color: COLORS.neutral.subtext,
                    marginBottom: '4px'
                  }}>
                    AI 모델
                  </p>
                  <p style={{ 
                    fontSize: '18px',
                    fontWeight: '600',
                    color: COLORS.neutral.text
                  }}>
                    {artwork.aiModel}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reactions */}
          <div style={{ 
            display: 'flex',
            gap: SPACING.sm,
            flexWrap: 'wrap',
            marginBottom: SPACING.lg
          }}>
            {artwork.reactions.map((reaction) => (
              <ReactionButton
                key={reaction.type}
                reaction={reaction}
                onReact={() => onReaction(artwork.id, reaction.type)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex',
            gap: SPACING.sm,
            justifyContent: 'center'
          }}>
            <Button 
              variant="outline" 
              onClick={() => onShare(artwork.id)}
            >
              공유하기
            </Button>
            <Button onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
