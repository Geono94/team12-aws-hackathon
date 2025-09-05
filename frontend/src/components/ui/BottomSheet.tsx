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
        background: '#1a1a1a',
        width: '100%',
        maxHeight: '60vh',
        borderRadius: `${BORDER_RADIUS.lg} ${BORDER_RADIUS.lg} 0 0`,
        position: 'relative',
        animation: 'slideUp 0.3s ease-out',
        overflow: 'hidden',
        border: '1px solid #333333'
      }}>
        {/* Handle */}
        <div style={{
          width: '40px',
          height: '4px',
          background: '#666666',
          borderRadius: '2px',
          margin: `${SPACING.sm} auto ${SPACING.md} auto`
        }} />
        
        {/* Header */}
        <div style={{
          padding: `0 ${SPACING.md} ${SPACING.md} ${SPACING.md}`,
          borderBottom: '1px solid #333333',
          position: 'relative'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#FFFFFF',
            textAlign: 'center',
            margin: 0
          }}>
            {title}
          </h3>
          
          {/* X Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: SPACING.md,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: 'none',
              background: '#2a2a2a',
              color: '#888888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s ease-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#333333';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2a2a2a';
              e.currentTarget.style.color = '#888888';
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div style={{
          padding: SPACING.md,
          maxHeight: 'calc(60vh - 100px)',
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
