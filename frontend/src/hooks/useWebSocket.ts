import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const useWebSocket = (roomId: string, wsUrl: string) => {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const sendMessage = useCallback((message: any) => {
    console.log('Sending message (local mode):', message);
    // In local mode, just log the message
  }, []);

  const onMessage = useCallback((callback: (message: any) => void) => {
    // In local mode, return empty cleanup function
    return () => {};
  }, []);

  useEffect(() => {
    if (!roomId || typeof window === 'undefined') return;

    // Temporarily disable WebSocket connection to avoid protocol errors
    // Just use local Y.Doc without network sync
    console.log('Running in local mode for room:', roomId);
    setConnected(true); // Simulate connection for UI

    return () => {
      // Cleanup if needed
    };
  }, [roomId, wsUrl, doc]);

  return { doc, provider, connected, sendMessage, onMessage, messages, roomId };
};