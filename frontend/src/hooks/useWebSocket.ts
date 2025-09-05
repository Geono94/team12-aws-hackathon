import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const useWebSocket = (roomId: string, wsUrl: string) => {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const sendMessage = useCallback((message: any) => {
    if (provider?.ws && connected) {
      const messageWithRoom = { ...message, roomId };
      provider.ws.send(JSON.stringify(messageWithRoom));
    }
  }, [provider, connected, roomId]);

  const onMessage = useCallback((callback: (message: any) => void) => {
    if (provider?.ws) {
      const handleMessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          // Only handle game messages (has type property and roomId)
          if (message.type && typeof message.type === 'string' && message.roomId) {
            callback(message);
            setMessages(prev => [...prev, message]);
          }
          // Ignore Yjs protocol messages
        } catch (error) {
          // If JSON parsing fails, it's likely a Yjs binary message - ignore
        }
      };
      
      provider.ws.addEventListener('message', handleMessage);
      return () => provider.ws?.removeEventListener('message', handleMessage);
    }
  }, [provider]);

  useEffect(() => {
    if (!roomId || !wsUrl || typeof window === 'undefined') return;

    try {
      const wsProvider = new WebsocketProvider(wsUrl, roomId, doc, {
        connect: true,
        params: {},
        resyncInterval: 5000,
        maxBackoffTime: 2500
      });
      
      wsProvider.on('status', (event: any) => {
        console.log('WebSocket status:', event.status);
        setConnected(event.status === 'connected');
      });

      wsProvider.on('connection-error', (error: any) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
      });

      wsProvider.on('connection-close', () => {
        console.log('WebSocket connection closed');
        setConnected(false);
      });
   
      setProvider(wsProvider);

      return () => {
        try {
          wsProvider.destroy();
        } catch (error) {
          console.error('Error destroying WebSocket provider:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket provider:', error);
      setConnected(false);
    }
  }, [roomId, wsUrl, doc]);

  return { doc, provider, connected, sendMessage, onMessage, messages, roomId };
};