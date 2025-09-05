import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const useYjsProvider = (roomId: string, wsUrl: string) => {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId || !wsUrl) return;

    const wsProvider = new WebsocketProvider(wsUrl, roomId, doc);
    
    wsProvider.on('status', (event: any) => {
      setConnected(event.status === 'connected');
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
    };
  }, [roomId, wsUrl, doc]);

  return { doc, provider, connected };
};
