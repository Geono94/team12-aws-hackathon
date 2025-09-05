const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://77q0bmlyb4.execute-api.us-east-1.amazonaws.com/prod';

export interface RoomResponse {
  roomId: string;
  playerCount: number;
  maxPlayers: number;
  players?: Array<{
    playerId: string;
    name: string;
    joinedAt: number;
  }>;
}

export async function getRoomInfo(roomId: string): Promise<RoomResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Room not found
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get room info failed:', error);
    // API endpoint not available yet, assume room doesn't exist
    return null;
  }
}

export async function joinRoom(playerId: string, playerName: string): Promise<RoomResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, playerName }),
    });

    if (!response.ok) {
      console.error(`API Error: HTTP ${response.status}: ${response.statusText}`);
      throw new Error('API_ERROR');
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed, using mock data:', error);
    
    // 임시 목 데이터 반환
    return {
      roomId: `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      playerCount: Math.floor(Math.random() * 3) + 1, // 1-3명
      maxPlayers: 4
    };
  }
}

export async function leaveRoom(roomId: string, playerId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, playerId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Leave room failed:', error);
    // 에러 무시하고 계속 진행
  }
}
