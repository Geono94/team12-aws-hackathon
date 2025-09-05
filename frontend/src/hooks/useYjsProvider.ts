import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const useYjsProvider = (roomId: string, wsUrl: string) => {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId || !wsUrl || typeof window === 'undefined') return;

    const wsProvider = new WebsocketProvider(wsUrl, roomId, doc, {
      connect: true,
      params: {}
    });
    
    wsProvider.on('status', (event: any) => {
      console.log('WebSocket status:', event.status);
      setConnected(event.status === 'connected');
    });

    wsProvider.on('connection-error', (error: any) => {
      console.error('WebSocket connection error:', error);
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
    };
  }, [roomId, wsUrl, doc]);

  return { doc, provider, connected };
};
