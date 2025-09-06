'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const { id } = await params;
      // feed/[id]를 result/[roomId]로 리다이렉트
      router.replace(`/result/${id}`);
    };
    
    redirect();
  }, [params, router]);

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
