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
        {/* Logo & Title */}
        <div style={{ marginBottom: SPACING.lg }}>
          <div style={{
            fontSize: '48px',
            marginBottom: SPACING.sm
          }}>
            🎨
          </div>
          <h1 style={{ 
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginBottom: SPACING.sm
          }}>
            DrawTogether
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#888888',
            marginBottom: SPACING.lg
          }}>
            친구들과 함께 그리고 AI가 변환해주는 재미있는 게임
          </p>
        </div>

        {/* Profile Section */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: SPACING.lg,
          marginBottom: SPACING.lg,
          minWidth: '320px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Profile Image - Center */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: SPACING.md 
          }}>
            <button
              onClick={handleProfileImageClick}
              style={{
                background: 'none',
                border: '3px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <img 
                src={profileImage} 
                alt="프로필"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </button>
          </div>

          {/* Name Input & Save Button - Same Line */}
          {isEditing ? (
            <div style={{ 
              display: 'flex', 
              gap: SPACING.sm, 
              alignItems: 'center',
              marginBottom: SPACING.md,
            }}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="닉네임을 입력하세요"
                maxLength={20}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #444',
                  borderRadius: '8px',
                  background: '#1a1a1a',
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
                  background: playerName.trim() ? COLORS.primary.main : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '12px 16px',
                  fontSize: '14px'
                }}
              >
                저장
              </Button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: SPACING.md,
              padding: SPACING.sm,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '500' }}>
                  {playerName}
                </div>
                <div style={{ color: '#888', fontSize: '12px' }}>
                  🟢 온라인
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                수정
              </button>
            </div>
          )}
        </div>

        {/* Quick Match Section */}
        <div style={{ marginBottom: SPACING.lg, width: '320px' }} className={"w-full"}>
          <Button 
            onClick={handleQuickMatch}
            disabled={!playerName.trim()}
            className="w-full text-lg px-4 py-4 border-none rounded-xl text-white font-bold shadow-lg cursor-pointer"
          >
            게임 시작하기
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
