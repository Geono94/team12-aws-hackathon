'use client';

import './globals.css';
import { YjsProvider } from "@/contexts/YjsContext";
import { useState } from 'react';

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
