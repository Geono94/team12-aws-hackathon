import { CardProps } from '@/types/ui';
import { COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '@/constants/design';

export default function Card({ children, className = '', hover = false }: CardProps) {
  const baseStyles = {
    background: COLORS.neutral.card,
    borderRadius: BORDER_RADIUS.lg,
    boxShadow: SHADOWS.card,
    padding: SPACING.md,
    transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
    cursor: hover ? 'pointer' : 'default',
  };

  const hoverStyles = hover ? {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    }
  } : {};

  return (
    <div 
      style={baseStyles}
      className={className}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = SHADOWS.card;
      } : undefined}
    >
      {children}
    </div>
  );
}
