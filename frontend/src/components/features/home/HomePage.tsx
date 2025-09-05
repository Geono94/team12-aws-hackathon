'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { COLORS, SPACING } from '@/constants/design';
import { ArtworkItem } from '@/types/ui';

interface HomePageProps {
  artworks: ArtworkItem[];
  onStartGame: () => void;
}

export default function HomePage({ artworks, onStartGame }: HomePageProps) {
  return (
    <div style={{ 
      padding: SPACING.md,
      background: COLORS.neutral.background,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: SPACING.xl,
        paddingTop: SPACING.lg 
      }}>
        <h1 style={{ 
          fontSize: '32px',
          fontWeight: 'bold',
          color: COLORS.neutral.text,
          marginBottom: SPACING.md
        }}>
          DrawTogether
        </h1>
        <Button size="lg" onClick={onStartGame}>
          🎨 새 게임 시작하기
        </Button>
      </div>

      {/* Recent Artworks Feed */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: '600',
          color: COLORS.neutral.text,
          marginBottom: SPACING.md
        }}>
          최근 작품들
        </h2>
        
        <div style={{ 
          display: 'grid',
          gap: SPACING.md,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
        }}>
          {artworks.map((artwork) => (
            <Card key={artwork.id} hover>
              <div style={{ display: 'flex', gap: SPACING.sm }}>
                <img 
                  src={artwork.originalImage} 
                  alt="Original"
                  style={{ 
                    width: '120px', 
                    height: '90px', 
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <img 
                  src={artwork.aiImage} 
                  alt="AI Generated"
                  style={{ 
                    width: '120px', 
                    height: '90px', 
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <div style={{ marginTop: SPACING.sm }}>
                <p style={{ 
                  fontWeight: '600',
                  color: COLORS.neutral.text,
                  marginBottom: '4px'
                }}>
                  주제: {artwork.topic}
                </p>
                <p style={{ 
                  fontSize: '14px',
                  color: COLORS.neutral.subtext
                }}>
                  {artwork.playerCount}명 참여 • {artwork.createdAt}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
