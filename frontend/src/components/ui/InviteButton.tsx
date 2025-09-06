import React from 'react';

interface InviteButtonProps {
  onInvite: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const InviteButton: React.FC<InviteButtonProps> = ({ 
  onInvite, 
  className,
  style 
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement;
    target.style.transform = 'translateY(-2px)';
    target.style.boxShadow = '0 6px 24px rgba(78,205,196,0.4)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement;
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = '0 4px 16px rgba(78,205,196,0.3)';
  };

  return (
    <button
      onClick={onInvite}
      className={className}
      style={{
        flex: 2,
        maxWidth: '200px',
        padding: '16px 24px',
        border: 'none',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: 'linear-gradient(135deg, #4ECDC4, #FF6B6B)',
        color: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(78,205,196,0.3)',
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      초대하기
    </button>
  );
};