import { COLORS, SPACING } from '@/constants/design';

interface BrushSizeSelectorProps {
  currentSize: number;
  onSizeChange: (size: number) => void;
}

export function BrushSizeSelector({ currentSize, onSizeChange }: BrushSizeSelectorProps) {
  const brushSizes = [
    { display: 8, stroke: 2 },
    { display: 12, stroke: 4 },
    { display: 16, stroke: 8 }
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
      {brushSizes.map(({ display, stroke }) => (
        <button
          key={stroke}
          onClick={() => onSizeChange(stroke)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: currentSize === stroke ? COLORS.primary.main : 'white',
            border: `2px solid ${currentSize === stroke ? COLORS.primary.main : '#ddd'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div
            style={{
              width: `${display}px`,
              height: `16px`,
              backgroundColor: currentSize === stroke ? 'white' : '#666',
              borderRadius: `${display/2}px`,
              clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)'
            }}
          />
        </button>
      ))}
    </div>
  );
}