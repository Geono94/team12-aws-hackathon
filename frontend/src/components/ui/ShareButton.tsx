import React from 'react';

interface ShareButtonProps {
  onShare: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ 
  onShare, 
  disabled = false,
  className,
  style 
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const target = e.target as HTMLButtonElement;
      target.style.transform = 'translateY(-2px)';
      target.style.boxShadow = '0 6px 20px rgba(255,107,107,0.4)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const target = e.target as HTMLButtonElement;
      target.style.transform = 'translateY(0)';
      target.style.boxShadow = '0 4px 12px rgba(255,107,107,0.3)';
    }
  };

  return (
    <button
      onClick={onShare}
      disabled={disabled}
      className={className}
      style={{
        flex: 1,
        padding: '16px',
        border: 'none',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        background: disabled 
          ? 'rgba(255,255,255,0.1)' 
          : 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
        color: disabled ? '#666' : '#FFFFFF',
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled ? 'none' : '0 4px 12px rgba(255,107,107,0.3)',
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      🔗 링크 복사
    </button>
  );
};