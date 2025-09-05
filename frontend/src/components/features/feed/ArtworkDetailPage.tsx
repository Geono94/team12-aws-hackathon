'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ReactionButton from '@/components/ui/ReactionButton';
import ImageCompareSlider from '@/components/ui/ImageCompareSlider';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { ArtworkItem } from '@/types/ui';

interface ArtworkDetailPageProps {
  artwork: ArtworkItem;
}

interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export default function ArtworkDetailPage({ artwork }: ArtworkDetailPageProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', user: 'artist_123', content: '정말 멋진 작품이네요! AI가 원본을 어떻게 해석했는지 흥미로워요', timestamp: '1시간 전', likes: 3, isLiked: false },
    { id: '2', user: 'creative_soul', content: '협업으로 만든 작품이라니 신기해요 👏', timestamp: '30분 전', likes: 1, isLiked: true }
  ]);
  const [newComment, setNewComment] = useState('');

  // Mock participants data
  const participants = ['player_1', 'artist_kim', 'creative_user', 'draw_master'];

  // Mock related artworks
  const relatedArtworks = [
    { id: '2', topic: artwork.topic, aiImage: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://drawtogether-test-1757052413482.s3.amazonaws.com'}/images/ai2.svg`, likes: 12 },
    { id: '3', topic: artwork.topic, aiImage: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://drawtogether-test-1757052413482.s3.amazonaws.com'}/images/ai3.svg`, likes: 8 },
    { id: '4', topic: artwork.topic, aiImage: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://drawtogether-test-1757052413482.s3.amazonaws.com'}/images/ai4.svg`, likes: 15 },
    { id: '5', topic: artwork.topic, aiImage: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://drawtogether-test-1757052413482.s3.amazonaws.com'}/images/ai5.svg`, likes: 6 }
  ];

  const handleReaction = (artworkId: string, reactionType: 'like') => {
    console.log('Reaction:', artworkId, reactionType);
  };

  const handleCommentLike = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked 
          }
        : comment
    ));
  };

  const handleShare = async () => {
    const shareData = {
      title: 'DrawTogether 작품',
      text: `${artwork.topic} 주제로 ${artwork.playerCount}명이 함께 그린 작품을 확인해보세요!`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop or unsupported browsers
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      // User cancelled share or other error
      console.log('Share cancelled or failed:', error);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: 'current_user',
        content: newComment.trim(),
        timestamp: '방금 전',
        likes: 0,
        isLiked: false
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  return (
    <div style={{ 
      background: '#000000',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: '#000000',
        borderBottom: '1px solid #333333',
        padding: `${SPACING.xs} ${SPACING.md}`,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              color: '#FFFFFF',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            <span>뒤로</span>
          </button>

          {/* Artwork Name & View Count */}
          <div style={{ 
            flex: 1, 
            textAlign: 'center',
            margin: `0 ${SPACING.md}`
          }}>
            <span style={{
              fontSize: '11px !important',
              fontWeight: '600',
              color: '#FFFFFF',
              margin: 0,
              lineHeight: '1.2',
              display: 'block'
            }}>
              #{artwork.topic} 작품
            </span>
            <p style={{
              fontSize: '10px',
              color: '#666666',
              margin: 0,
              marginTop: '2px'
            }}>
              조회수 156회
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: SPACING.xs 
          }}>
            {/* Share Button */}
            <button
              onClick={handleShare}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#FFFFFF',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>

            {/* More Actions Button */}
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#FFFFFF',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: SPACING.sm }}>
        <div>
          {/* Image Compare Slider */}
          <div style={{ 
            marginBottom: SPACING.sm,
            borderRadius: BORDER_RADIUS.lg,
            overflow: 'hidden',
            position: 'relative',
            height: '300px',
            width: '100%'
          }}>
            <ImageCompareSlider
              originalImage={artwork.originalImage}
              aiImage={artwork.aiImage}
              alt={`${artwork.topic} artwork comparison`}
            />
            
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

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: SPACING.sm,
            padding: `0 ${SPACING.xs}`
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: SPACING.sm
            }}>
              {/* Like Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction(artwork.id, 'like');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: artwork.reactions[0]?.userReacted ? COLORS.primary.main : '#888888',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill={artwork.reactions[0]?.userReacted ? 'currentColor' : 'none'}
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{artwork.reactions[0]?.count || 0}</span>
              </button>

              {/* Comment Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: '#888888',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease-out'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{comments.length}</span>
              </button>
            </div>

            {/* Meta Info */}
            <div style={{ 
              fontSize: '11px',
              color: '#666666',
              textAlign: 'right'
            }}>
              <div>{artwork.createdAt}</div>
            </div>
          </div>

          {/* Participants Section */}
          <div style={{
            padding: `2px ${SPACING.xs}`,
            marginBottom: SPACING.sm
          }}>
            <div style={{ 
              fontSize: '12px',
              color: '#888888',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ color: '#666666', flexShrink: 0 }}>참여:</span>
              <div style={{ 
                display: 'flex',
                gap: '6px',
                overflow: 'hidden'
              }}>
                {participants.slice(0, artwork.playerCount).map((participant, index) => (
                  <span key={index} style={{ 
                    color: '#4ECDC4',
                    fontWeight: '500',
                    flexShrink: 0
                  }}>
                    @{participant}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div style={{
            height: '1px',
            background: '#333333',
            margin: `${SPACING.sm} ${SPACING.xs}`,
          }}></div>

          {/* Comments */}
          <div style={{ marginBottom: SPACING.lg }}>
            {/* Comment Input */}
            <div style={{ 
              display: 'flex', 
              gap: SPACING.sm, 
              marginBottom: SPACING.md,
              padding: `0 ${SPACING.xs}`
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#333333',
                flexShrink: 0
              }}></div>
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글 추가..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333333',
                  padding: `${SPACING.xs} 0`,
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newComment.trim()) {
                    handleAddComment();
                  }
                }}
              />
              {newComment.trim() && (
                <button
                  onClick={handleAddComment}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4ECDC4',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  게시
                </button>
              )}
            </div>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{
                  display: 'flex',
                  gap: SPACING.sm,
                  padding: `${SPACING.xs} ${SPACING.xs}`,
                  marginBottom: SPACING.xs
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#333333',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs, marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>
                        {comment.user}
                      </span>
                      <span style={{ fontSize: '11px', color: '#666666' }}>
                        {comment.timestamp}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#CCCCCC', margin: 0, lineHeight: '1.3', marginBottom: '4px' }}>
                      {comment.content}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: comment.isLiked ? '#FF6B6B' : '#666666',
                          fontSize: '11px',
                          cursor: 'pointer',
                          padding: '2px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                      </button>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#666666',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: '2px 0'
                      }}>
                        답글
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Artworks */}
          <div style={{ marginTop: SPACING.lg }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#FFFFFF', 
              marginBottom: SPACING.md,
              padding: `0 ${SPACING.xs}`
            }}>
              #{artwork.topic} 다른 작품들
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: SPACING.xs,
              padding: `0 ${SPACING.xs}`
            }}>
              {relatedArtworks.map((related) => (
                <div
                  key={related.id}
                  onClick={() => router.push(`/feed/${related.id}`)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    transition: 'transform 0.2s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={related.aiImage}
                    alt={`${related.topic} artwork`}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    padding: SPACING.xs,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '12px', color: '#888888' }}>
                      #{related.topic}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: '#666666'
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span>{related.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
