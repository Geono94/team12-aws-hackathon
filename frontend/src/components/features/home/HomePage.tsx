'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ArtworkCard from '@/components/features/feed/ArtworkCard';
import { COLORS, SPACING } from '@/constants/design';
import { getPlayer, savePlayer } from '@/lib/player';
import { ArtworkItem, Reaction } from '@/types/ui';
import { useYjs } from '@/contexts/YjsContext';

interface HomePageProps { 
  artworks?: ArtworkItem[];
}

export default function HomePage({   artworks = [] }: HomePageProps) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [feedArtworks, setFeedArtworks] = useState(artworks);
  const [profileImage, setProfileImage] = useState('/characters/character1.svg');
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAvatars = [
    '/characters/character1.svg', // 기본 캐릭터 1 (디폴트) - 빨간색 웃는 얼굴
    '/characters/character2.svg', // 기본 캐릭터 2 - 청록색 동그란 입
    '/characters/character3.svg', // 기본 캐릭터 3 - 파란색 네모 입
    '/characters/character4.svg', // 기본 캐릭터 4 - 초록색 뿔 달린 캐릭터
    '/characters/character5.svg'  // 기본 캐릭터 5 - 보라색 안테나 캐릭터
  ];

  useEffect(() => {
    const player = getPlayer();
    if (player) {
      setPlayerName(player.name);
      setProfileImage(player.profileImage || defaultAvatars[0]);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, []);

  const {  onMessage, sendMessage } = useYjs();

  useEffect(() => {
    return onMessage((message) => {
      if (message.type === 'roomJoined') {
        window.location.href = '/drawing/' + message.data.roomId;
      }
    })
  }, [])
  
  const handleQuickMatch = () => {
    if (!playerName.trim()) {
      setIsEditing(true);
      return;
    }
    const player = getPlayer();
    if (!player) {
      return;
    }

    sendMessage({
      type: 'searchRoom',
      data: {
        playerId: player.id,
        playerName,
      }
    });
  };

  const handleNameSave = () => {
    if (playerName.trim()) {
      savePlayer(playerName, profileImage);
      setIsEditing(false);
    }
  };

  const handleProfileImageClick = () => {
    setShowProfileSelector(true);
  };

  const handleAvatarSelect = (avatar: string) => {
    setProfileImage(avatar);
    setShowProfileSelector(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        setShowProfileSelector(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReaction = (artworkId: string, reactionType: Reaction['type']) => {
    setFeedArtworks(prev => prev.map(artwork => {
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
    router.push(`/feed/${artworkId}`);
  };

  return (
    <div style={{ 
      background: '#000000',
      minHeight: '100vh'
    }}>
      {/* Profile Selector Modal */}
      {showProfileSelector && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: SPACING.lg,
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ color: '#FFFFFF', marginBottom: SPACING.md, textAlign: 'center' }}>
              프로필 이미지 선택
            </h3>
            
            {/* Default Avatars */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: SPACING.sm,
              marginBottom: SPACING.md
            }}>
              {defaultAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarSelect(avatar)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: profileImage === avatar ? `2px solid ${COLORS.primary.main}` : '2px solid transparent',
                    borderRadius: '12px',
                    padding: SPACING.sm,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <img 
                    src={avatar} 
                    alt={`캐릭터 ${index + 1}`}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.1)',
                border: '2px dashed rgba(255,255,255,0.3)',
                borderRadius: '12px',
                padding: SPACING.md,
                color: '#FFFFFF',
                cursor: 'pointer',
                marginBottom: SPACING.md
              }}
            >
              📁 이미지 업로드
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {/* Close Button */}
            <button
              onClick={() => setShowProfileSelector(false)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: SPACING.sm,
                color: '#888',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.lg,
        textAlign: 'center',
        minHeight: '100vh'
      }}>
        {/* Enhanced Logo & Title */}
        <div style={{ 
          marginBottom: SPACING.lg,
          position: 'relative'
        }}>
          {/* Animated Background */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 50%, rgba(240,147,251,0.1) 100%)',
            borderRadius: '50%',
            animation: 'pulse 3s ease-in-out infinite',
            zIndex: 0
          }} />
          
          {/* Logo */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            marginBottom: SPACING.md
          }}>
            <img 
              src="/logo.svg" 
              alt="DrawTogether Logo"
              style={{
                width: '80px',
                height: '80px',
                filter: 'drop-shadow(0 4px 12px rgba(102,126,234,0.3))',
                animation: 'float 4s ease-in-out infinite'
              }}
            />
          </div>
          
          {/* Title with Gradient */}
          <h1 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: SPACING.sm,
            position: 'relative',
            zIndex: 1
          }}>
            DrawTogether
          </h1>
          
          {/* Enhanced Subtitle */}
          <div style={{
            position: 'relative',
            zIndex: 1
          }}>
            <p style={{
              fontSize: '16px',
              color: '#888888',
              marginBottom: SPACING.lg
            }}>
              친구들과 함께 그리고 AI가 새로운 스타일로 변환해주는 게임
            </p>
          </div>
          
          {/* Feature Icons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: SPACING.lg,
            marginTop: SPACING.md,
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '24px',
                background: 'rgba(255,107,107,0.1)',
                padding: '8px',
                borderRadius: '12px',
                border: '1px solid rgba(255,107,107,0.2)'
              }}>
                👥
              </div>
              <span style={{ fontSize: '10px', color: '#999' }}>협업</span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '24px',
                background: 'rgba(118,75,162,0.1)',
                padding: '8px',
                borderRadius: '12px',
                border: '1px solid rgba(118,75,162,0.2)'
              }}>
                🤖
              </div>
              <span style={{ fontSize: '10px', color: '#999' }}>AI 생성</span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '24px',
                background: 'rgba(78,205,196,0.1)',
                padding: '8px',
                borderRadius: '12px',
                border: '1px solid rgba(78,205,196,0.2)'
              }}>
                🌐
              </div>
              <span style={{ fontSize: '10px', color: '#999' }}>커뮤니티</span>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: SPACING.xl,
          width: '100%',
          maxWidth: '320px'
        }}>
          {/* Profile Image */}
          <button
            onClick={handleProfileImageClick}
            style={{
              background: 'none',
              border: '2px solid rgba(255,255,255,0.15)',
              borderRadius: '50%',
              padding: '3px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: SPACING.md
            }}
          >
            <img 
              src={profileImage} 
              alt="프로필"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </button>

          {/* Name Section */}
          {isEditing ? (
            <div style={{ 
              display: 'flex', 
              gap: SPACING.xs, 
              alignItems: 'center',
              width: '100%'
            }}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="닉네임 입력"
                maxLength={20}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '16px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#FFFFFF',
                  outline: 'none',
                  textAlign: 'center'
                }}
                autoFocus
              />
              <Button
                onClick={handleNameSave}
                disabled={!playerName.trim()}
                style={{
                  background: playerName.trim() ? COLORS.primary.main : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px 14px',
                  fontSize: '14px',
                  minWidth: '50px'
                }}
              >
                ✓
              </Button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACING.xs,
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ 
                color: '#FFFFFF', 
                fontSize: '16px', 
                fontWeight: '500' 
              }}>
                {playerName}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px 4px'
                }}
              >
                ✏️
              </button>
            </div>
          )}
        </div>

        {/* Game Start Button - Centered */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: SPACING.lg,
          width: '100%'
        }}>
          <Button 
            onClick={handleQuickMatch}
            disabled={!playerName.trim()}
            className="w-full text-lg px-4 py-4 border-none rounded-xl text-white font-bold shadow-lg cursor-pointer max-w-xs"
            style={{
              background: playerName.trim() ? COLORS.primary.main : 'rgba(255,255,255,0.1)',
              cursor: playerName.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: playerName.trim() ? '0 4px 16px rgba(255,107,107,0.3)' : 'none'
            }}
          >
            🎮 게임 시작하기
          </Button>
        </div>

        {/* Info */}
        <div style={{
          marginTop: SPACING.lg,
          fontSize: '12px',
          color: '#666666'
        }}>
          최대 4명까지 함께 플레이 가능
        </div>
      </div>

      {/* Feed Section */}
      {feedArtworks.length > 0 && (
        <div style={{ 
          padding: SPACING.lg,
          borderTop: '1px solid #333333'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              margin: `0 0 ${SPACING.lg} 0`,
              textAlign: 'center'
            }}>
              🎨 최근 작품들
            </h2>

            <div style={{ 
              display: 'grid',
              gap: SPACING.md,
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
            }}>
              {feedArtworks.slice(0, 4).map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onReaction={handleReaction}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
