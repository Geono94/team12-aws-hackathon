import React from 'react';

interface HomeButtonProps {
  onGoHome: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const HomeButton: React.FC<HomeButtonProps> = ({ 
  onGoHome, 
  className,
  style 
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement;
    target.style.background = 'rgba(255,255,255,0.1)';
    target.style.borderColor = 'rgba(255,255,255,0.3)';
    target.style.transform = 'translateY(-2px)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement;
    target.style.background = 'rgba(255,255,255,0.05)';
    target.style.borderColor = 'rgba(255,255,255,0.2)';
    target.style.transform = 'translateY(0)';
  };

  return (
    <button
      onClick={onGoHome}
      className={className}
      style={{
        padding: '18px',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: 'rgba(255,255,255,0.05)',
        color: '#FFFFFF',
        backdropFilter: 'blur(10px)',
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      홈으로 돌아가기
    </button>
  );
};