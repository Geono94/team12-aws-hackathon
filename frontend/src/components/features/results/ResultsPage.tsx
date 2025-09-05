'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useResults } from '@/hooks/useResults';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  
  const { originalImage, aiImage, isLoading, loadingMessage } = useResults(roomId);
  
  const [playerCount] = useState(4);
  const [topic] = useState('자유 주제');
  const [activeTab, setActiveTab] = useState<'original' | 'ai'>('original');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [funFacts] = useState([
    "🎨 AI가 당신의 그림을 분석하고 있어요",
    "✨ 새로운 스타일로 변환 중이에요",
    "🤖 창의적인 요소들을 추가하고 있어요",
    "🎭 마지막 터치를 더하고 있어요"
  ]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // AI 생성 대기시간 동안의 재미있는 효과들
  useEffect(() => {
    if (isLoading) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      const factInterval = setInterval(() => {
        setCurrentFactIndex(prev => (prev + 1) % funFacts.length);
      }, 2000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(factInterval);
      };
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading, funFacts.length]);

  const onGoHome = () => {
    router.push('/');
  };

  const handleDownloadImage = () => {
    const imageUrl = activeTab === 'original' ? originalImage : aiImage;
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `drawtogether-${activeTab}-${roomId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareResult = async () => {
    const imageUrl = activeTab === 'original' ? originalImage : aiImage;
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DrawTogether 작품',
          text: `${playerCount}명이 함께 만든 작품을 확인해보세요!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      backgroundColor: '#000000',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            ✨ 완성! ✨
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#FFFFFF',
            marginBottom: '8px'
          }}>
            함께 만든 작품을 확인해보세요
          </p>
          {/* 게임 정보 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            fontSize: '14px',
            color: '#888',
            marginTop: '8px'
          }}>
            <span>👥 {playerCount}명 참여</span>
            <span>🎯 주제: {topic}</span>
            <span>⏱️ 30초 드로잉</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '4px',
          marginBottom: '24px',
          width: '100%',
          maxWidth: '400px'
        }}>
          <button
            onClick={() => setActiveTab('original')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: activeTab === 'original' ? '2px solid #FF6B6B' : '2px solid transparent',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'original' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: activeTab === 'original' ? '#FFFFFF' : '#888888',
              boxShadow: activeTab === 'original' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            원본 작품
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            disabled={isLoading || !aiImage}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: activeTab === 'ai' ? '2px solid #FF6B6B' : '2px solid transparent',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading || !aiImage ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'ai' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: activeTab === 'ai' ? '#FFFFFF' : '#888888',
              boxShadow: activeTab === 'ai' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              opacity: isLoading || !aiImage ? 0.6 : 1
            }}
          >
            AI 변환 {isLoading ? '⏳' : '✨'}
          </button>
        </div>

        {/* Image Area */}
        <div style={{
          width: '100%',
          height: '400px',
          border: '3px solid #FF6B6B',
          borderRadius: '20px',
          padding: '16px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          {activeTab === 'original' ? (
            <img
              src={originalImage}
              alt="Original artwork"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '12px',
                objectFit: 'contain'
              }}
            />
          ) : isLoading ? (
            <div style={{
              textAlign: 'center',
              color: '#718096',
              fontSize: '18px',
              width: '100%'
            }}>
              {/* 애니메이션 로딩 */}
              <div style={{
                fontSize: '64px',
                marginBottom: '16px',
                animation: 'float 2s ease-in-out infinite'
              }}>
                🎨
              </div>
              
              {/* 진행률 바 */}
              <div style={{
                width: '80%',
                height: '8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
                margin: '0 auto 16px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${loadingProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              
              <p style={{ marginBottom: '8px', fontWeight: '600' }}>
                {funFacts[currentFactIndex]}
              </p>
              <p style={{ fontSize: '14px', color: '#999' }}>
                {Math.round(loadingProgress)}% 완료
              </p>
            </div>
          ) : aiImage ? (
            <img
              src={aiImage}
              alt="AI generated artwork"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '12px',
                objectFit: 'contain'
              }}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#718096',
              fontSize: '18px'
            }}>
              <p>AI 변환에 실패했습니다</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '400px',
          marginTop: '24px'
        }}>
          {/* 저장 및 공유 버튼 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleDownloadImage}
              disabled={!originalImage && !aiImage}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: '2px solid #4ECDC4',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (!originalImage && !aiImage) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(78,205,196,0.1)',
                color: '#4ECDC4',
                opacity: (!originalImage && !aiImage) ? 0.5 : 1
              }}
            >
              💾 저장하기
            </button>
            
            <button
              onClick={handleShareResult}
              disabled={!originalImage && !aiImage}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: '2px solid #45B7D1',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (!originalImage && !aiImage) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(69,183,209,0.1)',
                color: '#45B7D1',
                opacity: (!originalImage && !aiImage) ? 0.5 : 1
              }}
            >
              📤 공유하기
            </button>
          </div>

          {/* 홈으로 돌아가기 */}
          <button
            onClick={onGoHome}
            style={{
              padding: '16px 32px',
              border: '2px solid #FF6B6B',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255,107,107,0.1)',
              color: '#FF6B6B'
            }}
          >
            🏠 홈으로 돌아가기
          </button>
        </div>

        {/* 통계 정보 (간소화) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginTop: '16px',
          padding: '16px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B6B' }}>
              {playerCount}명
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>참여자</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ECDC4' }}>
              30초
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>드로잉</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#45B7D1' }}>
              {aiImage ? '완료' : '대기중'}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>AI 변환</div>
          </div>
        </div>
      </div>
    </div>
  );
}
