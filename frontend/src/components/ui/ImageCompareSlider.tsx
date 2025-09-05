'use client';

import { useState, useRef, useEffect } from 'react';
import { COLORS, SPACING } from '@/constants/design';

interface ImageCompareSliderProps {
  originalImage: string;
  aiImage: string;
  alt?: string;
}

export default function ImageCompareSlider({ 
  originalImage, 
  aiImage, 
  alt = 'Artwork comparison' 
}: ImageCompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(95);
  const [isDragging, setIsDragging] = useState(false);
  const [originalImageError, setOriginalImageError] = useState(false);
  const [aiImageError, setAiImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2NjY2IiBmb250LXNpemU9IjE2Ij7snbTrr7jsp4Drpbwg67aE7J2EIOyImCDsl4bsnYQ8L3RleHQ+Cjwvc3ZnPgo=';

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.touches[0]);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      updateSliderPosition(e.touches[0]);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (event: MouseEvent | Touch | React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* AI Image (Background) */}
      <img
        src={aiImageError ? fallbackImage : aiImage}
        alt={`${alt} - AI version`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none'
        }}
        draggable={false}
        onError={() => setAiImageError(true)}
      />

      {/* Original Image (Foreground with clip) */}
      <img
        src={originalImageError ? fallbackImage : originalImage}
        alt={`${alt} - Original`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          pointerEvents: 'none'
        }}
        draggable={false}
        onError={() => setOriginalImageError(true)}
      />

      {/* Slider Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: `${sliderPosition}%`,
          width: '2px',
          height: '100%',
          background: 'white',
          boxShadow: '0 0 4px rgba(0,0,0,0.5)',
          transform: 'translateX(-1px)',
          pointerEvents: 'none'
        }}
      />

      {/* Slider Handle */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${sliderPosition}%`,
          width: '32px',
          height: '32px',
          background: 'white',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: COLORS.neutral.text,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        ⟷
      </div>

      {/* Labels */}
      {sliderPosition < 90 && (
        <div
          style={{
            position: 'absolute',
            top: SPACING.sm,
            right: SPACING.sm,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: `4px ${SPACING.sm}`,
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none'
          }}
        >
          AI
        </div>
      )}

      {sliderPosition > 10 && (
        <div
          style={{
            position: 'absolute',
            top: SPACING.sm,
            left: SPACING.sm,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: `4px ${SPACING.sm}`,
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none'
          }}
        >
          원본
        </div>
      )}

      {/* Instruction Text (only when not dragging and at initial position) */}
      {!isDragging && sliderPosition === 95 && (
        <div
          style={{
            position: 'absolute',
            bottom: SPACING.md,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: `${SPACING.xs} ${SPACING.sm}`,
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none',
            animation: 'fadeInOut 3s ease-in-out infinite'
          }}
        >
          ← 드래그해서 AI 변환 보기
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
