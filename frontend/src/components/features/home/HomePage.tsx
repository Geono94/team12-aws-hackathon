'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { COLORS, SPACING } from '@/constants/design';
import { getPlayer } from '@/lib/player';

interface HomePageProps {
  onStartGame: (playerName: string) => void;
  isLoading?: boolean;
}

export default function HomePage({ onStartGame, isLoading = false }: HomePageProps) {
  const [playerName, setPlayerName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const player = getPlayer();
    if (player) {
      setPlayerName(player.name);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleStartClick = () => {
    if (playerName.trim()) {
      onStartGame(playerName.trim());
    }
  };

  const handleNameChange = () => {
    setIsEditing(true);
  };

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

      {/* Player Name Section */}
      <div style={{ marginBottom: SPACING.xl, minWidth: '300px' }}>
        {isEditing ? (
          <div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="플레이어 이름을 입력하세요"
              maxLength={20}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '18px',
                border: '2px solid #444',
                borderRadius: '12px',
                background: '#1a1a1a',
                color: '#FFFFFF',
                marginBottom: SPACING.md,
                outline: 'none',
                textAlign: 'center'
              }}
              autoFocus
            />
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: SPACING.md,
            borderRadius: '12px',
            marginBottom: SPACING.md,
            color: '#FFFFFF',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>환영합니다, {playerName}님!</span>
            <button
              onClick={handleNameChange}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              변경
            </button>
          </div>
        )}
      </div>

      {/* Main Action Button */}
      <div style={{ marginBottom: SPACING.xl }}>
        <Button 
          size="lg" 
          onClick={handleStartClick}
          disabled={!playerName.trim() || isLoading}
          style={{
            fontSize: '24px',
            padding: '20px 40px',
            background: (playerName.trim() && !isLoading) ? COLORS.primary.main : '#666',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transform: 'scale(1)',
            transition: 'all 0.3s ease',
            cursor: (playerName.trim() && !isLoading) ? 'pointer' : 'not-allowed'
          }}
          onMouseEnter={(e) => {
            if (playerName.trim() && !isLoading) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          }}
        >
          {isLoading ? '🔄 연결 중...' : '🚀 게임 시작하기'}
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
