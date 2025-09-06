'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useResults } from '@/hooks/useResults';
import ImageCompareSlider from '@/components/ui/ImageCompareSlider';
import { SaveButton } from '@/components/ui/SaveButton';
import { ShareButton } from '@/components/ui/ShareButton';
import { HomeButton } from '@/components/ui/HomeButton';
import AIAnalysisSection from './AIAnalysisSection';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  
  const { originalImage, aiImage, isLoading, imageAnalysis, topic } = useResults(roomId);
  
  const [playerCount] = useState(4);
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

  const handleDownloadImage = async () => {
    const imageUrl = aiImage || originalImage;
    if (!imageUrl) return;

    try {
      // fetch를 사용해서 이미지를 blob으로 가져오기
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // blob URL 생성
      const blobUrl = URL.createObjectURL(blob);

      // 다운로드 링크 생성
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `drawtogether-${roomId || 'artwork'}.png`;
      
      // DOM에 추가하고 클릭
      document.body.appendChild(link);
      link.click();
      
      // 정리
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      console.log('✅ 이미지 다운로드 완료');
    } catch (error) {
      console.error('❌ 이미지 다운로드 실패:', error);
      // 실패 시 기존 방법으로 시도
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `drawtogether-${roomId || 'artwork'}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareResult = async () => {
    try {
      // 현재 결과 페이지 URL을 클립보드에 복사
      const currentPageUrl = window.location.href;
      await navigator.clipboard.writeText(currentPageUrl);
      alert('🔗 결과 페이지 링크가 클립보드에 복사되었습니다!\n카카오톡이나 다른 앱에 붙여넣기하여 공유하세요.');
      console.log('✅ 결과 페이지 링크 복사 완료:', currentPageUrl);
    } catch (error) {
      console.error('❌ 클립보드 복사 실패:', error);
      alert('클립보드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.');
    }
  };

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      backgroundColor: '#000000',
      minHeight: '30vh',
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
        gap: '24px'
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
        {!isLoading && (
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
            
            {/* 변환 메시지 - 인라인 레이아웃 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '12px',
              marginBottom: '1px',
              padding: '12px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '32px',
                animation: 'float 2s ease-in-out infinite',
                flexShrink: 0
              }}>
                🎨
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#FFFFFF',
                  marginBottom: '6px',
                  margin: 0
                }}>
                  {funFacts[currentFactIndex]}
                </p>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#888',
                  margin: 0
                }}>
                  AI가 그림을 분석하고 새로운 스타일로 변환하고 있어요
                </p>
              </div>
            </div>

            {/* AI 분석 섹션 - AI 변환 중일 때만 표시 */}
            <AIAnalysisSection 
              imageAnalysis={imageAnalysis}
              topic={topic}
            />
          </div>
        )}

        {/* Image Area */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '4/3',
          borderRadius: '20px',
          padding: '6px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          margin: '0 16px'
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
            gap: '16px',
            width: '100%',
            maxWidth: '400px',
            marginTop: '32px'
          }}>
            {/* 저장 및 공유 버튼 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <SaveButton 
                onSave={handleDownloadImage}
                disabled={!originalImage}
              />
              <ShareButton 
                onShare={handleShareResult}
                disabled={!originalImage}
              />
            </div>

            {/* 홈으로 돌아가기 */}
            <HomeButton onGoHome={onGoHome} />
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
