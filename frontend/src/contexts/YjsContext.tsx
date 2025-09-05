'use client';

import { createContext, useContext, ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useYjsProvider } from '@/hooks/useYjsProvider';

interface YjsContextType {
  doc: Y.Doc | null;
  provider: WebsocketProvider | null;
  connected: boolean;
}

const YjsContext = createContext<YjsContextType>({
  doc: null,
  provider: null,
  connected: false,
});

interface YjsProviderProps {
  children: ReactNode;
  roomId?: string;
}

export function YjsProvider({ children, roomId = 'default' }: YjsProviderProps) {
  const wsUrl = typeof window !== 'undefined' 
    ? (process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}` 
        : 'ws://localhost:3001')
    : 'ws://localhost:3001';
  
  console.log('YjsProvider connecting to:', wsUrl, 'room:', roomId);
    
  const { doc, provider, connected } = useYjsProvider(roomId, wsUrl);

  return (
    <YjsContext.Provider value={{ doc, provider, connected }}>
      {children}
    </YjsContext.Provider>
  );
}

export const useYjs = () => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYjs must be used within a YjsProvider');
  }
  return context;
};