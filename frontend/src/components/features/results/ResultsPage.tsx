'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useResults } from '@/hooks/useResults';
import ImageCompareSlider from '@/components/ui/ImageCompareSlider';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  
  const { originalImage, aiImage, isLoading, loadingMessage } = useResults(roomId);
  
  const [playerCount] = useState(4);
  const [topic] = useState('자유 주제');
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
      const startTime = Date.now();
      const targetDuration = 30000; // 30초
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / targetDuration) * 100, 99); // 최대 99%까지만
        
        setLoadingProgress(progress);
        
        // 30초 이상 경과하면 진행률 업데이트 중단
        if (elapsed >= targetDuration) {
          clearInterval(progressInterval);
        }
      }, 100); // 100ms마다 업데이트로 부드러운 애니메이션

      const factInterval = setInterval(() => {
        setCurrentFactIndex(prev => (prev + 1) % funFacts.length);
      }, 4000); // 2초 → 4초로 변경

      return () => {
        clearInterval(progressInterval);
        clearInterval(factInterval);
      };
    } else {
      // AI 변환 완료 시 즉시 100%로 설정
      setLoadingProgress(100);
    }
  }, [isLoading, funFacts.length]);

  const onGoHome = () => {
    router.push('/');
  };

  const handleDownloadImage = () => {
    const imageUrl = aiImage || originalImage;
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `drawtogether-${roomId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareResult = async () => {
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

        {/* Progress Bar (moved to where tabs were) */}
        {isLoading && (
          <div style={{
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#FFFFFF',
                fontWeight: '500'
              }}>
                AI 변환 진행 중
              </span>
              <span style={{
                fontSize: '14px',
                color: '#4ECDC4',
                fontWeight: 'bold'
              }}>
                {Math.round(loadingProgress)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
                borderRadius: '6px',
                transition: 'width 0.1s ease',
                boxShadow: '0 0 8px rgba(78,205,196,0.3)'
              }} />
            </div>
            
            {/* 변환 메시지 - 프로그래스 바 아래로 이동 */}
            <div style={{
              textAlign: 'center',
              marginTop: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '12px',
                animation: 'float 2s ease-in-out infinite'
              }}>
                🎨
              </div>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: '#FFFFFF',
                marginBottom: '4px'
              }}>
                {funFacts[currentFactIndex]}
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: '#888'
              }}>
                AI가 그림을 분석하고 새로운 스타일로 변환하고 있어요
              </p>
            </div>
          </div>
        )}

        {/* Image Area */}
        <div style={{
          width: '100%',
          height: '400px',
          borderRadius: '20px',
          padding: '16px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          {isLoading ? (
            /* 로딩 중에도 원본 이미지 표시 */
            originalImage ? (
              <img
                src={originalImage}
                alt="Original artwork"
                style={{
                  width: '100%',
                  height: '100%',
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
                <p>원본 이미지를 불러오는 중...</p>
              </div>
            )
          ) : originalImage && aiImage ? (
            /* 완료 후 비교 슬라이더 - 팔레트 내부에 직접 배치 */
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <ImageCompareSlider
                originalImage={originalImage}
                aiImage={aiImage}
                alt="DrawTogether artwork"
              />
            </div>
          ) : originalImage ? (
            <img
              src={originalImage}
              alt="Original artwork"
              style={{
                width: '100%',
                height: '100%',
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
              <p>이미지를 불러올 수 없습니다</p>
            </div>
          )}
        </div>

        {/* Action Buttons - AI 변환 중에는 숨김 */}
        {!isLoading && (
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
                disabled={!originalImage}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: '2px solid #4ECDC4',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: !originalImage ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(78,205,196,0.1)',
                  color: '#4ECDC4',
                  opacity: !originalImage ? 0.5 : 1
                }}
              >
                💾 저장하기
              </button>
              
              <button
                onClick={handleShareResult}
                disabled={!originalImage}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: '2px solid #45B7D1',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: !originalImage ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(69,183,209,0.1)',
                  color: '#45B7D1',
                  opacity: !originalImage ? 0.5 : 1
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
        )}

      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
