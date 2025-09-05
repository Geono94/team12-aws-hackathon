import { COLORS, SPACING } from "@/constants/design";

interface ColorPaletteProps {
  colors: string[];
  currentColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPalette({ colors, currentColor, onColorChange }: ColorPaletteProps) {
  return (
    <div style={{ display: 'flex', gap: SPACING.xs }}>
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: color,
            border: currentColor === color ? `3px solid ${COLORS.neutral.text}` : '2px solid white',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      ))}
    </div>
  );
}