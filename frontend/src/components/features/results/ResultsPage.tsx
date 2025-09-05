'use client';

import { useState } from 'react';
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

  const onGoHome = () => {
    router.push('/');
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
            marginBottom: '24px'
          }}>
            함께 만든 작품을 확인해보세요
          </p>
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
              fontSize: '18px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                animation: 'pulse 2s infinite'
              }}>
                🎨
              </div>
              <p>{loadingMessage}</p>
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

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '500px',
          marginTop: '24px'
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#FF6B6B'
            }}>
              {playerCount}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#FFFFFF',
              fontWeight: '500'
            }}>
              참여자
            </div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#4ECDC4'
            }}>
              30
            </div>
            <div style={{
              fontSize: '16px',
              color: '#FFFFFF',
              fontWeight: '500'
            }}>
              초 소요
            </div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#45B7D1'
            }}>
              95%
            </div>
            <div style={{
              fontSize: '16px',
              color: '#FFFFFF',
              fontWeight: '500'
            }}>
              AI 신뢰도
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '400px',
          marginTop: '32px'
        }}>
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
              background: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.borderColor = '#FF8C8C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = '#FF6B6B';
            }}
          >
            🏠 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
