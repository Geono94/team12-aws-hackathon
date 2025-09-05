'use client';

import { useRef, useEffect, useState } from 'react';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';
import { GAME_CONFIG } from '@/constants/game';

interface DrawingCanvasProps {
  timeLeft: number;
  topic: string;
  onDrawingChange: (imageData: string) => void;
}

export default function DrawingCanvas({ 
  timeLeft, 
  topic, 
  onDrawingChange 
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS.primary.main);

  const colors = [
    COLORS.primary.main,
    COLORS.primary.sub,
    COLORS.primary.accent,
    '#FFD93D',
    '#6BCF7F',
    '#FF8C42',
    '#9B59B6',
    '#2D3748'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = GAME_CONFIG.CANVAS_SIZE.width;
    canvas.height = GAME_CONFIG.CANVAS_SIZE.height;

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Emit drawing data
    const imageData = canvas.toDataURL();
    onDrawingChange(imageData);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: SPACING.md
    }}>
      {/* Timer and Topic */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: SPACING.md
      }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          color: COLORS.neutral.text,
          marginBottom: SPACING.xs
        }}>
          주제: {topic}
        </h2>
        <div style={{ 
          fontSize: '20px',
          fontWeight: '600',
          color: timeLeft <= 10 ? COLORS.primary.main : COLORS.primary.accent,
          padding: SPACING.sm,
          background: COLORS.neutral.card,
          borderRadius: BORDER_RADIUS.md,
          display: 'inline-block'
        }}>
          {Math.ceil(timeLeft / 1000)}초 남음
        </div>
      </div>

      {/* Color Palette */}
      <div style={{ 
        display: 'flex',
        gap: SPACING.xs,
        marginBottom: SPACING.sm
      }}>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setCurrentColor(color)}
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

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          border: `2px solid ${COLORS.neutral.border}`,
          borderRadius: BORDER_RADIUS.sm,
          cursor: 'crosshair',
          background: 'white',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
}
