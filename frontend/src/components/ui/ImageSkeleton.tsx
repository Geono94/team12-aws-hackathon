'use client';

import { useState } from 'react';

interface ImageSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: () => void;
}

export default function ImageSkeleton({ src, alt, className, style, onError }: ImageSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      {/* Skeleton */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #333 25%, #444 50%, #333 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 'inherit'
          }}
        />
      )}
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          borderRadius: 'inherit'
        }}
      />

      {/* Error State */}
      {hasError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#222',
            color: '#666',
            fontSize: '12px',
            borderRadius: 'inherit'
          }}
        >
          이미지 로드 실패
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
