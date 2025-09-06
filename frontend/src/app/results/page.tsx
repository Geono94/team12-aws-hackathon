'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Results() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roomId = searchParams.get('roomId');
    if (roomId) {
      // 쿼리 파라미터 형태를 새로운 경로 형태로 리다이렉트
      router.replace(`/result/${roomId}`);
    } else {
      // roomId가 없으면 홈으로
      router.replace('/');
    }
  }, [searchParams, router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff'
    }}>
      <div>리다이렉트 중...</div>
    </div>
  );
}
