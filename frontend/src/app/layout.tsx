'use client';

import type { Metadata } from 'next';
import '../styles/globals.css';
import { YjsProvider } from "@/contexts/YjsContext";
import { useState } from 'react';

// export const metadata: Metadata = {
//   title: 'DrawTogether - 실시간 협업 드로잉 AI 게임',
//   description: '최대 4명이 함께 그림을 그리고 AI가 새로운 스타일로 재생성해주는 엔터테이먼트 서비스',
//   viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  
  return (
    <html lang="ko">
      <body>
        <YjsProvider>
          {children} 
        </YjsProvider>
      </body>
    </html>
  );
}
