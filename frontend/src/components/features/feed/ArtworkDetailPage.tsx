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
}

export default function ArtworkDetailPage({ artwork }: ArtworkDetailPageProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', user: 'artist_123', content: '정말 멋진 작품이네요! AI가 원본을 어떻게 해석했는지 흥미로워요', timestamp: '1시간 전' },
    { id: '2', user: 'creative_soul', content: '협업으로 만든 작품이라니 신기해요 👏', timestamp: '30분 전' }
  ]);
  const [newComment, setNewComment] = useState('');

  // Mock participants data
  const participants = ['player_1', 'artist_kim', 'creative_user', 'draw_master'];

  const handleReaction = (artworkId: string, reactionType: 'like') => {
    console.log('Reaction:', artworkId, reactionType);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'DrawTogether 작품',
        text: `${artwork.topic} 주제로 ${artwork.playerCount}명이 함께 그린 작품을 확인해보세요!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: 'current_user',
        content: newComment.trim(),
        timestamp: '방금 전'
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
        background: '#1a1a1a',
        borderBottom: '1px solid #333333',
        padding: SPACING.md,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#FFFFFF'
              }}
            >
              ←
            </button>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              margin: 0
            }}>
              작품 상세
            </h1>
          </div>
          
          {/* Share Button */}
          <button
            onClick={handleShare}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#FFFFFF',
              padding: SPACING.xs
            }}
          >
            📤
          </button>
        </div>
      </div>

      <div style={{ padding: SPACING.md }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Image Compare Slider */}
          <div style={{ 
            marginBottom: SPACING.lg,
            borderRadius: BORDER_RADIUS.lg,
            overflow: 'hidden',
            position: 'relative'
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

          {/* Modern Info Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            borderRadius: '20px',
            padding: SPACING.lg,
            marginBottom: SPACING.lg,
            border: '1px solid #333333'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🎨
              </div>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  {artwork.topic}
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#888888',
                  margin: 0
                }}>
                  {artwork.createdAt} • {artwork.aiModel}
                </p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: SPACING.md,
              marginBottom: SPACING.lg
            }}>
              <div style={{ textAlign: 'center', padding: SPACING.sm, background: '#333333', borderRadius: '12px' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF', margin: 0 }}>
                  {artwork.playerCount}
                </p>
                <p style={{ fontSize: '12px', color: '#888888', margin: 0 }}>참여자</p>
              </div>
              <div style={{ textAlign: 'center', padding: SPACING.sm, background: '#333333', borderRadius: '12px' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF', margin: 0 }}>30</p>
                <p style={{ fontSize: '12px', color: '#888888', margin: 0 }}>초</p>
              </div>
              <div style={{ textAlign: 'center', padding: SPACING.sm, background: '#333333', borderRadius: '12px' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF', margin: 0 }}>
                  {artwork.reactions[0]?.count || 0}
                </p>
                <p style={{ fontSize: '12px', color: '#888888', margin: 0 }}>좋아요</p>
              </div>
            </div>

            {/* Participants */}
            <div style={{ marginBottom: SPACING.lg }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: SPACING.sm }}>
                참여한 아티스트
              </h3>
              <div style={{ display: 'flex', gap: SPACING.xs, flexWrap: 'wrap' }}>
                {participants.slice(0, artwork.playerCount).map((participant, index) => (
                  <span key={index} style={{
                    background: '#333333',
                    color: '#FFFFFF',
                    padding: `4px ${SPACING.sm}`,
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    @{participant}
                  </span>
                ))}
              </div>
            </div>

            {/* Reactions */}
            <div style={{ 
              display: 'flex',
              gap: SPACING.sm,
              flexWrap: 'wrap'
            }}>
              {artwork.reactions.map((reaction) => (
                <ReactionButton
                  key={reaction.type}
                  reaction={reaction}
                  onReact={() => handleReaction(artwork.id, reaction.type)}
                />
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ 
            background: '#1a1a1a',
            borderRadius: '20px',
            padding: SPACING.lg,
            border: '1px solid #333333'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF', marginBottom: SPACING.md }}>
              댓글 {comments.length}
            </h3>
            
            {/* Comment Input */}
            <div style={{ marginBottom: SPACING.lg }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성해보세요..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  background: '#2a2a2a',
                  border: '1px solid #444444',
                  borderRadius: '12px',
                  padding: SPACING.sm,
                  color: '#FFFFFF',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: SPACING.sm }}>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  style={{
                    background: newComment.trim() ? '#4ECDC4' : '#333333',
                    color: newComment.trim() ? '#000000' : '#888888',
                    border: 'none',
                    borderRadius: '20px',
                    padding: `${SPACING.xs} ${SPACING.md}`,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: newComment.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  댓글 작성
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{
                  background: '#2a2a2a',
                  borderRadius: '12px',
                  padding: SPACING.md
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF' }}>
                      @{comment.user}
                    </span>
                    <span style={{ fontSize: '12px', color: '#888888' }}>
                      {comment.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#CCCCCC', margin: 0, lineHeight: '1.4' }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
