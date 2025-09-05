'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';

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
      padding: SPACING.md,
      background: COLORS.neutral.background,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '32px',
          fontWeight: 'bold',
          color: COLORS.neutral.text,
          marginBottom: SPACING.sm
        }}>
          완성! 🎉
        </h1>
        
        <p style={{ 
          fontSize: '18px',
          color: COLORS.neutral.subtext,
          marginBottom: SPACING.xl
        }}>
          주제: "{topic}" • {playerCount}명이 함께 그렸어요
        </p>

        <Card>
          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex',
            marginBottom: SPACING.md,
            background: COLORS.neutral.background,
            borderRadius: BORDER_RADIUS.md,
            padding: '4px'
          }}>
            <button
              onClick={() => setActiveTab('original')}
              style={{
                flex: 1,
                padding: SPACING.sm,
                borderRadius: BORDER_RADIUS.sm,
                border: 'none',
                background: activeTab === 'original' ? COLORS.primary.main : 'transparent',
                color: activeTab === 'original' ? 'white' : COLORS.neutral.text,
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease-out'
              }}
            >
              원본 작품
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              disabled={isLoading || !aiImage}
              style={{
                flex: 1,
                padding: SPACING.sm,
                borderRadius: BORDER_RADIUS.sm,
                border: 'none',
                background: activeTab === 'ai' ? COLORS.primary.accent : 'transparent',
                color: activeTab === 'ai' ? 'white' : COLORS.neutral.text,
                fontWeight: '600',
                cursor: isLoading || !aiImage ? 'not-allowed' : 'pointer',
                opacity: isLoading || !aiImage ? 0.6 : 1,
                transition: 'all 0.2s ease-out'
              }}
            >
              AI 변환 {isLoading ? '⏳' : '✨'}
            </button>
          </div>

          {/* Image Display */}
          <div style={{ 
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: SPACING.lg
          }}>
            {activeTab === 'original' ? (
              <img
                src={originalImage}
                alt="Original artwork"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  borderRadius: BORDER_RADIUS.sm,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            ) : isLoading ? (
              <div style={{ 
                textAlign: 'center',
                color: COLORS.neutral.subtext
              }}>
                <div style={{ 
                  fontSize: '48px',
                  marginBottom: SPACING.md,
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
                  maxHeight: '400px',
                  borderRadius: BORDER_RADIUS.sm,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <div style={{ 
                textAlign: 'center',
                color: COLORS.neutral.subtext
              }}>
                <p>AI 변환에 실패했습니다</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex',
            gap: SPACING.sm,
            justifyContent: 'center'
          }}>
            <Button variant="outline" onClick={onGoHome}>
              홈으로
            </Button>
            <Button onClick={onPlayAgain}>
              다시 하기
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
