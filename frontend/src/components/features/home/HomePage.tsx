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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          color: 'white',
          marginBottom: SPACING.sm,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          DrawTogether
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.9)',
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
            background: 'linear-gradient(45deg, #ff6b6b, #ffa726)',
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 8px 20px rgba(255,107,107,0.4)',
            transform: 'scale(1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 25px rgba(255,107,107,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,107,107,0.4)';
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
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            borderRadius: '25px',
            padding: '12px 24px',
            fontSize: '16px',
            backdropFilter: 'blur(10px)'
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
        color: 'rgba(255,255,255,0.7)'
      }}>
        최대 4명까지 함께 플레이 가능
      </div>
    </div>
  );
}
