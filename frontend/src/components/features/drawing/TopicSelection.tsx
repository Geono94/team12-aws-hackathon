'use client';

import { useState, useEffect } from 'react';
import { COLORS, SPACING } from '@/constants/design';
import { TOPICS } from '@/constants/game';

 interface TopicSelectionProps {
  selectedTopic: string; 
  duration?: number;
}

export default function TopicSelection({ selectedTopic, duration = 3000 }: TopicSelectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const stopTime = duration - 1500; // 1.5초 전에 멈춤
    
    const roll = () => {
      setCurrentIndex(prev => (prev + 1) % TOPICS.length);
    };

    // Start rolling fast
    interval = setInterval(roll, 80);

    // Slow down after 40% of duration
    setTimeout(() => {
      clearInterval(interval);
      interval = setInterval(roll, 200);
    }, duration * 0.4);

    // Final slow down
    setTimeout(() => {
      clearInterval(interval);
      interval = setInterval(roll, 500);
    }, stopTime - 500);

    // Stop and show selected topic
    setTimeout(() => {
      clearInterval(interval);
      setIsFinished(true);
    }, stopTime);

    return () => clearInterval(interval);
  }, [duration, selectedTopic]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.lg,
      padding: SPACING.xl,
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: COLORS.primary.main,
        marginBottom: SPACING.md
      }}>
        🎯 주제 선정 중...
      </h2>
      
      <div style={{
        width: '300px',
        height: '120px',
        border: `3px solid ${COLORS.primary.main}`,
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isFinished ? COLORS.neutral.background : 'white',
        transition: 'all 0.5s ease',
        boxShadow: isFinished ? '0 8px 20px rgba(255, 107, 107, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: isFinished ? 'black' : COLORS.primary.main,
          transform: isFinished ? 'scale(1.4)' : 'scale(1)',
          transition: 'all 0.5s ease'
        }}>
          {isFinished ? selectedTopic : TOPICS[currentIndex]}
        </div>
      </div>

      {isFinished && (
        <div style={{
          fontSize: '18px',
          color: COLORS.primary.main,
          fontWeight: '600',
          animation: 'fadeIn 0.5s ease'
        }}>
          ✨ 주제가 결정되었습니다! ✨
        </div>
      )}
    </div>
  );
}