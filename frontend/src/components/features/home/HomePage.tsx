'use client';

import Button from '@/components/ui/Button';
import { COLORS, SPACING } from '@/constants/design';

interface HomePageProps {
  onStartGame: () => void;
}

export default function HomePage({ onStartGame }: HomePageProps) {
  const handleViewFeed = () => {
    window.location.href = '/feed';
  };

  return (
    <div style={{ 
      background: '#000000',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.lg,
      textAlign: 'center'
    }}>
      {/* Logo & Title */}
      <div style={{ marginBottom: SPACING.xl }}>
        <div style={{
          fontSize: '64px',
          marginBottom: SPACING.sm
        }}>
          🎨
        </div>
        <h1 style={{ 
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginBottom: SPACING.sm
        }}>
          DrawTogether
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#888888',
          marginBottom: SPACING.xl
        }}>
          친구들과 함께 그리고 AI가 변환해주는 재미있는 게임
        </p>
      </div>

      {/* Main Action Button */}
      <div style={{ marginBottom: SPACING.xl }}>
        <Button 
          size="lg" 
          onClick={onStartGame}
          style={{
            fontSize: '24px',
            padding: '20px 40px',
            background: COLORS.primary.main,
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transform: 'scale(1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          }}
        >
          🚀 게임 시작하기
        </Button>
      </div>

      {/* Secondary Action */}
      <div>
        <Button 
          variant="outline" 
          onClick={handleViewFeed}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#FFFFFF',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px'
          }}
        >
          📱 작품 피드 보기
        </Button>
      </div>

      {/* Bottom decoration */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        fontSize: '14px',
        color: '#666666'
      }}>
        최대 4명까지 함께 플레이 가능
      </div>
    </div>
  );
}
