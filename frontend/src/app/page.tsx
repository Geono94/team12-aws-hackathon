'use client';

import { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  
  // WebSocket URL - will be replaced with actual AWS API Gateway WebSocket URL
  const wsUrl = 'ws://localhost:1234';

  const joinRoom = () => {
    if (roomId.trim()) {
      setJoined(true);
    }
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  if (!joined) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            DrawTogether
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={6}
              />
            </div>
            
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Join Room
            </button>
            
            <div className="text-center">
              <span className="text-gray-500">or</span>
            </div>
            
            <button
              onClick={generateRoomId}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700"
            >
              Create New Room
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">DrawTogether</h1>
          <p className="text-gray-600">Room: <span className="font-mono font-bold">{roomId}</span></p>
          <button
            onClick={() => setJoined(false)}
            className="mt-2 text-purple-600 hover:text-purple-800 underline"
          >
            Leave Room
          </button>
        </div>
        
        <DrawingCanvas roomId={roomId} wsUrl={wsUrl} />
      </div>
    </main>
  );
}
