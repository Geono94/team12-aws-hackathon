'use client';

import { useEffect } from 'react';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end'
    }}>
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div style={{
        background: COLORS.neutral.card,
        width: '100%',
        maxHeight: '70vh',
        borderRadius: `${BORDER_RADIUS.lg} ${BORDER_RADIUS.lg} 0 0`,
        position: 'relative',
        animation: 'slideUp 0.3s ease-out',
        overflow: 'hidden'
      }}>
        {/* Handle */}
        <div style={{
          width: '40px',
          height: '4px',
          background: COLORS.neutral.border,
          borderRadius: '2px',
          margin: `${SPACING.sm} auto ${SPACING.md} auto`
        }} />
        
        {/* Header */}
        <div style={{
          padding: `0 ${SPACING.md} ${SPACING.md} ${SPACING.md}`,
          borderBottom: `1px solid ${COLORS.neutral.border}`
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: COLORS.neutral.text,
            textAlign: 'center'
          }}>
            {title}
          </h3>
        </div>
        
        {/* Content */}
        <div style={{
          padding: SPACING.md,
          maxHeight: 'calc(70vh - 100px)',
          overflowY: 'auto'
        }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
