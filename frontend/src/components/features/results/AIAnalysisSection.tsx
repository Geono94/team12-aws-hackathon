import { ImageAnalysis } from '@/lib/api/room';
import React, { useState, useEffect } from 'react';

const AIAnalysisSection = ({ imageAnalysis, topic }: {
  imageAnalysis: ImageAnalysis; topic: string;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState<Record<string, { key: string; icon: string; label: string; text: string }>>({});
  const [fadingOut, setFadingOut] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!imageAnalysis) return;

    const analysisData = generateAnalysisText(imageAnalysis, topic);
    const steps = [
      { key: 'interpretation', icon: '📝', label: '추론', text: analysisData.interpretation },
      { key: 'guess', icon: '🎯', label: '정답 예측', text: analysisData.guess },
      { key: 'best', icon: '⭐', label: '베스트', text: analysisData.best },
      { key: 'worst', icon: '❌', label: '워스트', text: analysisData.worst }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setAnalysis(prev => ({ ...prev, [step.key]: step }));
        setCurrentStep(index + 1);

        // 이전 단계 fade out (첫 번째 제외)
        if (index > 0) {
          setTimeout(() => {
            setFadingOut(prev => ({ ...prev, [steps[index - 1].key]: true }));
          }, 2000);
        }
      }, index * 3000);
    });
  }, [imageAnalysis, topic]);

  return (
    <div style={{
      margin: '16px 0',
      padding: '16px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{
        margin: '0 0 12px 0',
        color: '#FFFFFF',
        fontSize: '16px',
        fontWeight: '600'
      }}>
        🤖 AI 결과 분석
      </h3>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: '12px',
        borderRadius: '8px',
        minHeight: '60px'
      }}>
        {Object.entries(analysis).map(([key, step]) => (
          <AnalysisItem
            key={key}
            icon={step.icon}
            label={step.label}
            text={step.text}
            fadeOut={fadingOut[key] || false}
          />
        ))}
        {currentStep === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#888',
            fontStyle: 'italic',
            padding: '16px',
            animation: 'pulse 1.5s infinite'
          }}>
            분석 중...
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const AnalysisItem = ({ icon, label, text, fadeOut }: { icon: string; label: string; text: string; fadeOut: boolean }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    margin: '8px 0',
    padding: '6px',
    borderRadius: '6px',
    transition: 'all 0.5s ease-in-out',
    opacity: fadeOut ? 0.3 : 1,
    transform: fadeOut ? 'translateY(-10px)' : 'translateY(0)',
    fontSize: fadeOut ? '0.9em' : '1em',
    animation: fadeOut ? 'none' : 'slideIn 0.5s ease-out'
  }}>
    <span style={{
      fontSize: '16px',
      flexShrink: 0
    }}>
      {icon}
    </span>
    <div style={{
      flex: 1,
      lineHeight: 1.4,
      color: '#FFFFFF'
    }}>
      <strong style={{
        color: '#4ECDC4',
        marginRight: '4px'
      }}>
        {label}:
      </strong>
      {text}
    </div>
  </div>
);

const generateAnalysisText = (imageAnalysis: ImageAnalysis, actualTopic: string) => {
  if (!imageAnalysis) {
    return {
      interpretation: `그림을 분석하고 있습니다...`,
      guess: `"${actualTopic}" 주제를 표현하려 한 것 같습니다.`,
      best: `전체적인 구성이 인상적입니다.`,
      worst: `더 많은 세부 요소가 있었다면 좋았을 것 같아요.`
    };
  }

  return {
    interpretation: `AI가 "${imageAnalysis.subject}"로 예상했습니다. ${imageAnalysis.style} 스타일로 표현되었네요.`,
    guess: `아하, 실제 그림 주제는 "${actualTopic}"이네요. "${imageAnalysis.technicalEvaluation}`, 
    best: `저는 "${imageAnalysis.mvp}"이 제일 좋은 단서였어요`,
    worst: `저는 "${imageAnalysis.worst}"이 제일 헷갈렸어요`
  };
};

export default AIAnalysisSection;
