'use client';

import { useRouter } from 'next/navigation';
import { SPACING } from '@/constants/design';

export default function GameInvite() {
  const router = useRouter();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
      borderRadius: '20px',
      padding: SPACING.lg,
      margin: `${SPACING.xl} 0`,
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '32px',
        marginBottom: SPACING.sm
      }}>
        🎨
      </div>
      
      <h3 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#FFFFFF',
        margin: 0,
        marginBottom: SPACING.md
      }}>
        드로잉 매칭 시작하기
      </h3>
      
      <button
        onClick={() => router.push('/matching')}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '25px',
          padding: `${SPACING.sm} ${SPACING.lg}`,
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease-out'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        매칭 시작
      </button>
    </div>
  );
}
