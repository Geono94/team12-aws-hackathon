'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ArtworkCard from '@/components/features/feed/ArtworkCard';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { getPlayer, savePlayer } from '@/lib/player';
import { ArtworkItem, Reaction } from '@/types/ui';
import { useYjs } from '@/contexts/YjsContext';
import { getFinishedRooms } from '@/lib/api/room';
import { createArtworkFromRoom } from '@/lib/utils/artwork';
import { Title } from './Title';

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [showFixedButton, setShowFixedButton] = useState(false);
  const [isSearchingRoom, setIsSearchingRoom] = useState(false);

  // Feed state
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [hasMoreArtworks, setHasMoreArtworks] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  useEffect(() => {
    const player = getPlayer();
    if (player) {
      setPlayerName(player.name);
    }
  }, []);

  // Load initial feed data
  const loadFeedData = useCallback(async (reset = false) => {
    // 더 엄격한 조건 검사
    if (isLoadingFeed) {
      return;
    }
    
    if (!reset && !hasMoreArtworks) {
      return;
    }
    
    setIsLoadingFeed(true);
    
    if (reset) {
      setCursor(undefined);
      setHasMoreArtworks(false);
    }
    
    try {
      const response = await getFinishedRooms(10, reset ? undefined : cursor);
      
      const newArtworks: ArtworkItem[] = response.rooms.map(createArtworkFromRoom);

      if (reset) {
        setArtworks(newArtworks);
      } else {
        // 중복 제거하면서 추가
        setArtworks(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNewItems = newArtworks.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        });
      }
      
      setCursor(response.cursor);
      setHasMoreArtworks(response.hasMore);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setIsLoadingFeed(false);
    }
  }, [cursor, hasMoreArtworks, isLoadingFeed]);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasMoreArtworks || isLoadingFeed) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadFeedData(false);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreArtworks, isLoadingFeed, loadFeedData]);

  useEffect(() => {
    loadFeedData(true);
  }, []);

  // Scroll detection for fixed button
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFixedButton(scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const {  onMessage, sendMessage } = useYjs();

  useEffect(() => {
    return onMessage((message) => {
      if (message.type === 'roomJoined') {
        router.push('/drawing/' + message.data.roomId);
      }
    })
  }, [])
  
  const handleQuickMatch = () => {
    if (!playerName.trim()) {
      return;
    }
    
    // 닉네임 자동 저장
    savePlayer(playerName.trim(), '/characters/character1.svg');
    
    const player = getPlayer();
    if (!player) {
      return;
    }

    setIsSearchingRoom(true);
    sendMessage({
      type: 'searchRoom',
      data: {
        playerId: player.id,
        playerName: playerName.trim(),
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && playerName.trim() && !isSearchingRoom) {
      handleQuickMatch();
    }
  };

  const handleReaction = (artworkId: string, reactionType: Reaction['type']) => {
    setArtworks(prev => prev.map(artwork => {
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
    router.push(`/result/${artworkId}`);
  };

  return (
    <div style={{ 
      background: '#000000',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '414px', // iPhone 14 Pro Max width
        minHeight: '100vh'
      }}>
        {/* Fixed Game Start Button */}
        {showFixedButton && (
          <div style={{
            position: 'fixed',
            top: SPACING.md,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            animation: 'slideDown 0.3s ease-out'
          }}>
            <Button 
              onClick={handleQuickMatch}
              disabled={!playerName.trim() || isSearchingRoom}
              size="sm"
              className="min-w-[160px]"
            >
              {isSearchingRoom ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                '🎨 드로잉 시작하기'
              )}
            </Button>
          </div>
        )}
        {/* Hero Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${SPACING.md} ${SPACING.lg}`,
          textAlign: 'center',
          minHeight: '80vh'
        }}>
        {/* Enhanced Logo & Title */}
        <div style={{ 
          marginBottom: SPACING.md,
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
          <Title />
          
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
              친구와 함께하는 Ai 드로잉
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: SPACING.lg,
          width: '100%',
          maxWidth: '320px'
        }}>
          {/* Name Input */}
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="닉네임을 입력하세요"
            maxLength={20}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              color: '#FFFFFF',
              outline: 'none',
              textAlign: 'center',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Game Start Button - Centered */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: SPACING.md,
          width: '100%'
        }}>
          <Button 
            onClick={handleQuickMatch}
            disabled={!playerName.trim() || isSearchingRoom}
            size="lg"
            className="min-w-[200px] max-w-xs"
          >
            {isSearchingRoom ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid #fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              '🎨 드로잉 시작하기'
            )}
          </Button>
        </div>

        {/* Scroll Hint */}
        <div style={{
          marginTop: SPACING.lg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#fff',
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            커뮤니티 작품 보기
          </div>
          <div style={{
            fontSize: '24px',
            color: '#fff',
            animation: 'bounce 2s infinite',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            ↓
          </div>
        </div>
      </div>

        {/* Feed Section */}
        <div style={{ 
          padding: SPACING.lg,
          paddingTop: SPACING.xl,
          borderTop: '1px solid #333333'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: SPACING.lg,
            gap: SPACING.sm
          }}>
            <div style={{
              height: '1px',
              background: 'linear-gradient(to right, transparent, #333, transparent)',
              flex: 1
            }} />
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              margin: 0,
              padding: `0 ${SPACING.md}`,
              whiteSpace: 'nowrap'
            }}>
              🎨 커뮤니티 작품들
            </h2>
            <div style={{
              height: '1px',
              background: 'linear-gradient(to left, transparent, #333, transparent)',
              flex: 1
            }} />
          </div>

          {/* Loading Skeleton */}
          {isLoadingFeed && artworks.length === 0 && (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: SPACING.md
            }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{
                  background: '#1a1a1a',
                  borderRadius: BORDER_RADIUS.lg,
                  overflow: 'hidden',
                  height: '400px'
                }}>
                  {/* Image skeleton */}
                  <div style={{
                    height: '240px',
                    background: 'linear-gradient(90deg, #333 25%, #444 50%, #333 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite'
                  }} />
                  {/* Content skeleton */}
                  <div style={{ padding: SPACING.md }}>
                    <div style={{
                      height: '20px',
                      background: '#333',
                      borderRadius: '4px',
                      marginBottom: SPACING.sm
                    }} />
                    <div style={{
                      height: '16px',
                      background: '#333',
                      borderRadius: '4px',
                      width: '60%'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {artworks.length === 0 && !isLoadingFeed ? (
            <div style={{
              textAlign: 'center',
              padding: SPACING.xl,
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: SPACING.md }}>🎨</div>
              <p>아직 완료된 작품이 없습니다.</p>
              <p style={{ fontSize: '14px', marginTop: SPACING.xs }}>
                게임을 플레이하고 첫 번째 작품을 만들어보세요!
              </p>
            </div>
          ) : artworks.length > 0 ? (
            <>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: SPACING.md
              }}>
                {artworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onReaction={handleReaction}
                    onViewDetail={handleViewDetail}
                  />
                ))}
              </div>

              {/* Loading indicator */}
              {isLoadingFeed && (
                <div style={{
                  textAlign: 'center',
                  padding: SPACING.lg,
                  color: '#666'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: SPACING.sm }}>🎨</div>
                  <p>더 많은 작품을 불러오는 중...</p>
                </div>
              )}

              {/* Infinite scroll trigger */}
              {hasMoreArtworks && (
                <div 
                  ref={loadMoreRef}
                  style={{ 
                    height: '20px',
                    margin: SPACING.md,
                    background: 'transparent'
                  }} 
                />
              )}

              {/* End message */}
              {!hasMoreArtworks && artworks.length > 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: SPACING.lg,
                  color: '#666',
                  borderTop: '1px solid #333',
                  marginTop: SPACING.lg
                }}>
                  <p>모든 작품을 확인했습니다! 🎉</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
