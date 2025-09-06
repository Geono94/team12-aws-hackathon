'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResults } from '@/hooks/useResults';
import ImageCompareSlider from '@/components/ui/ImageCompareSlider';
import { SaveButton } from '@/components/ui/SaveButton';
import { ShareButton } from '@/components/ui/ShareButton';
import { HomeButton } from '@/components/ui/HomeButton';
import AIAnalysisSection from './AIAnalysisSection';

interface ResultsPageProps {
  params?: Promise<{ roomId: string }>;
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState<string | null>(null);
  const isFromDrawing = searchParams.get('from') === 'drawing';
  
  useEffect(() => {
    const getRoomId = async () => {
      if (params) {
        const { roomId: paramRoomId } = await params;
        setRoomId(paramRoomId);
      }
    };
    getRoomId();
  }, [params]);
  
  const { originalImage, aiImage, isLoading, imageAnalysis, topic, roomInfo } = useResults(roomId);
  
  const [playerCount] = useState(4);
  const [loadingProgress, setLoadingProgress] = useState(isFromDrawing ? 0 : 100);
  const [funFacts] = useState([
    "🎨 AI가 당신의 그림을 분석하고 있어요",
    "✨ 새로운 스타일로 변환 중이에요", 
    "🤖 창의적인 요소들을 추가하고 있어요",
    "🎭 마지막 터치를 더하고 있어요"
  ]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // AI 생성 대기시간 동안의 재미있는 효과들
  useEffect(() => {
    // from=drawing이 아니면 애니메이션 효과 없이 바로 완료 상태로 설정
    if (!isFromDrawing) {
      setLoadingProgress(100);
      return;
    }

    if (isLoading) {
      // 로딩 시작 시 0으로 초기화
      setLoadingProgress(0);
      
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
  }, [isLoading, funFacts.length, isFromDrawing]);

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
    const currentPageUrl = window.location.href;
    
    // Web Share API 지원 여부 확인
    if (navigator.share) {
      try {
        console.log('📱 Web Share API로 네이티브 공유 시트 띄우기');
        await navigator.share({
          title: 'DrawTogether 협업 작품 🎨',
          text: `${playerCount}명이 함께 만든 협업 드로잉 작품을 확인해보세요! AI가 새롭게 재탄생시킨 작품도 함께 감상하세요.`,
          url: currentPageUrl
        });
        console.log('✅ 네이티브 공유 완료');
      } catch (error) {
        // 사용자가 공유를 취소한 경우
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('✅ 사용자가 공유를 취소했습니다.');
          return;
        }
        console.error('❌ Web Share API 실패:', error);
        alert('공유 기능을 사용할 수 없습니다. 브라우저 설정을 확인해주세요.');
      }
    } else {
      console.log('❌ Web Share API를 지원하지 않는 브라우저입니다.');
      alert('이 브라우저는 공유 기능을 지원하지 않습니다. 모바일 브라우저에서 시도해보세요.');
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
            marginBottom: '16px'
          }}>
            함께 만든 작품을 확인해보세요
          </p>
          {/* from=drawing일 때만 헤더에 주제 표시 */}
          {isFromDrawing && topic && (
            <div style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: 'rgba(78, 205, 196, 0.15)',
              border: '2px solid #4ECDC4',
              borderRadius: '20px',
              marginTop: '8px'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#4ECDC4'
              }}>
                주제: {topic}
              </span>
            </div>
          )}
        </div>

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
          {!originalImage ? (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, #333 25%, #444 50%, #333 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }} />
          ) : isLoading ? (
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
          ) : originalImage && aiImage ? (
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
          ) : (
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
          )}
        </div>

        {/* 주제 - from=drawing이 아닐 때만 이미지 아래에 표시 */}
        {!isFromDrawing && topic && (
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: 'rgba(78, 205, 196, 0.15)',
            border: '2px solid #4ECDC4',
            borderRadius: '20px'
          }}>
            <span style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#4ECDC4'
            }}>
              주제: {topic}
            </span>
          </div>
        )}

        {/* from=drawing일 때 진행률 바와 AI 분석 섹션을 이미지 아래에 배치 */}
        {isFromDrawing && (
          <>
            {/* 분석 준비 메시지 - 초기 로딩 시에만 */}
            {(!imageAnalysis && !roomInfo) && (
              <div style={{
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '32px',
                  animation: 'float 2s ease-in-out infinite'
                }}>
                  🎨
                </div>
                <div>
                  <p style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#FFFFFF',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    AI 분석을 준비하고 있어요
                  </p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#888',
                    margin: 0
                  }}>
                    잠시만 기다려주세요...
                  </p>
                </div>
              </div>
            )}

            {/* 진행률 바 - roomInfo가 있고 completed가 아닐 때 */}
            {roomInfo && roomInfo.aiStatus !== 'completed' && (
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '500' }}>
                    AI 변환 진행 중
                  </span>
                  <span style={{ fontSize: '14px', color: '#4ECDC4', fontWeight: 'bold' }}>
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
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '12px',
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
                      margin: 0,
                      marginBottom: '6px'
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
              </div>
            )}

            {/* AI 분석 섹션 */}
            {imageAnalysis && (
              <AIAnalysisSection 
                imageAnalysis={imageAnalysis}
                topic={topic}
                isFromDrawing={true}
              />
            )}
          </>
        )}

        {/* from=drawing이 아닐 때 AI 분석 섹션 */}
        {!isFromDrawing && imageAnalysis && (
          <AIAnalysisSection 
            imageAnalysis={imageAnalysis}
            topic={topic}
            isFromDrawing={false}
          />
        )}

        {/* Action Buttons - 로딩 중이 아니고, from=drawing이 아니거나 분석이 완료된 경우 */}
        {!isLoading && (!isFromDrawing || imageAnalysis) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
            maxWidth: '400px',
            marginTop: '32px'
          }}>
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
            <HomeButton onGoHome={onGoHome} />
          </div>
        )}

      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
