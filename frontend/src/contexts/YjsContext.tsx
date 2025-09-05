'use client';

import { createContext, useContext, ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useWebSocket } from '@/hooks/useWebSocket';

interface YjsContextType {
  doc: Y.Doc | null;
  provider: WebsocketProvider | null;
  connected: boolean;
  sendMessage: (message: any) => void;
  onMessage: (callback: (message: any) => void) => (() => void) | undefined;
  messages: any[];
  roomId: string;
}

const YjsContext = createContext<YjsContextType>({
  doc: null,
  provider: null,
  connected: false,
  sendMessage: () => {},
  onMessage: () => undefined,
  messages: [],
  roomId: '',
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
    
  const { doc, provider, connected, sendMessage, onMessage, messages, roomId: currentRoomId } = useWebSocket(roomId, wsUrl);

  return (
    <YjsContext.Provider value={{ doc, provider, connected, sendMessage, onMessage, messages, roomId: currentRoomId }}>
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