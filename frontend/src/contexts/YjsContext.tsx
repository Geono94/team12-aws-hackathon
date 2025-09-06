'use client';

import { createContext, useContext, ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ClientToServerMessage, ServerToClientMessage } from '@/types';

interface YjsContextType {
  doc: Y.Doc | null;
  provider: WebsocketProvider | null;
  connected: boolean;
  sendMessage: (message: ClientToServerMessage) => void;
  onMessage: (callback: (message: ServerToClientMessage) => void) => (() => void) | undefined;
  roomId: string;
}

const YjsContext = createContext<YjsContextType>({
  doc: null,
  provider: null,
  connected: false, 
  sendMessage: () => {},
  onMessage: () => undefined,
  roomId: '',
});

interface YjsProviderProps {
  children: ReactNode;
  roomId?: string; 
}

export function YjsProvider({ children,   roomId = 'default' }: YjsProviderProps) {
  const wsUrl = typeof window !== 'undefined' 
    ? (window.location.protocol === 'https:'
        ? `wss://${window.location.host}` 
        : `ws://${window.location.hostname}:3001`)
    : `ws://172.30.3.57:3001`;
    
  const { doc, provider, connected, sendMessage, onMessage, roomId: currentRoomId } = useWebSocket(roomId, wsUrl);

  if (!connected) {
    return null;
  }

  return (
    <YjsContext.Provider value={{   doc, provider, connected, sendMessage, onMessage, roomId: currentRoomId }}>
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