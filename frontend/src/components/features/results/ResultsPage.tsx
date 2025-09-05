'use client';

import { useState } from 'react';

interface ResultsPageProps {
  originalImage: string;
  aiImage?: string;
  topic: string;
  playerCount: number;
  isLoading: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function ResultsPage({
  originalImage,
  aiImage,
  topic,
  playerCount,
  isLoading,
  onPlayAgain,
  onGoHome
}: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState<'original' | 'ai'>('original');

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#2D3748',
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
            color: '#718096',
            marginBottom: '24px'
          }}>
            함께 만든 작품을 확인해보세요
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: '#E2E8F0',
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
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'original' ? 'white' : 'transparent',
              color: activeTab === 'original' ? '#2D3748' : '#718096',
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
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading || !aiImage ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'ai' ? 'white' : 'transparent',
              color: activeTab === 'ai' ? '#2D3748' : '#718096',
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
              <p>AI가 작품을 재해석하고 있어요...</p>
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
              color: '#718096',
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
              color: '#718096',
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
              color: '#718096',
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
            onClick={onPlayAgain}
            style={{
              padding: '16px 32px',
              border: 'none',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 107, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
            }}
          >
            🔄 다시 하기
          </button>
          <button
            onClick={onGoHome}
            style={{
              padding: '16px 32px',
              border: '2px solid #E2E8F0',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'white',
              color: '#2D3748'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.borderColor = '#CBD5E0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            🏠 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
