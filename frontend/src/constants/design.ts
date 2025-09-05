export const COLORS = {
  primary: {
    main: '#FF6B6B',
    sub: '#4ECDC4',
    accent: '#45B7D1',
  },
  neutral: {
    background: '#FAFAFA',
    card: '#FFFFFF',
    text: '#2D3748',
    subtext: '#718096',
    border: '#E2E8F0',
  },
} as const;

export const SPACING = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  xxl: '64px',
} as const;

export const TYPOGRAPHY = {
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif',
  },
  sizes: {
    caption: '14px',
    body: '16px',
    heading: '24px',
  },
} as const;

export const BORDER_RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
} as const;

export const SHADOWS = {
  card: '0 2px 8px rgba(0,0,0,0.1)',
  button: '0 4px 12px rgba(0,0,0,0.15)',
} as const;
