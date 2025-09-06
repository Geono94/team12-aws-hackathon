import React from 'react';

interface LeaveButtonProps {
  onLeave: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const LeaveButton: React.FC<LeaveButtonProps> = ({ 
  onLeave, 
  className,
  style
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement;
    target.style.background = 'rgba(255,255,255,0.15)';
    target.style.color = '#FFFFFF';
    target.style.transform = 'translateY(-2px)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement;
    target.style.background = 'rgba(255,255,255,0.1)';
    target.style.color = 'rgba(255,255,255,0.8)';
    target.style.transform = 'translateY(0)';
  };

  return (
    <button
      onClick={onLeave}
      className={className}
      style={{
        flex: 0.7,
        maxWidth: '100px',
        padding: '16px 24px',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      나가기
    </button>
  );
};