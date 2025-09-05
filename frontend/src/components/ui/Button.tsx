import { ButtonProps } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/design';

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  children, 
  onClick 
}: ButtonProps) {
  const baseStyles = {
    borderRadius: BORDER_RADIUS.md,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  };

  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${COLORS.primary.main}, ${COLORS.primary.accent})`,
      color: 'white',
      boxShadow: SHADOWS.button,
    },
    secondary: {
      background: COLORS.neutral.card,
      color: COLORS.neutral.text,
      border: `1px solid ${COLORS.neutral.border}`,
    },
    outline: {
      background: 'transparent',
      color: COLORS.primary.main,
      border: `2px solid ${COLORS.primary.main}`,
    },
  };

  const sizes = {
    sm: { padding: `${SPACING.xs} ${SPACING.sm}`, fontSize: '14px', height: '36px' },
    md: { padding: `${SPACING.sm} ${SPACING.md}`, fontSize: '16px', height: '48px' },
    lg: { padding: `${SPACING.md} ${SPACING.lg}`, fontSize: '18px', height: '56px' },
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        opacity: disabled ? 0.6 : 1,
      }}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
