const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

export interface RoomResponse {
  roomId: string;
  playerCount: number;
  maxPlayers: number;
  status?: 'waiting' | 'playing' | 'finished';
  topic?: string;
  createdAt?: number;
  finishedAt?: number;
  completedAt?: Date;
  players?: Array<{
    playerId: string;
    name: string;
    joinedAt: number;
  }>;
}

export interface PaginatedRoomsResponse {
  rooms: RoomResponse[];
  cursor?: string;
  hasMore: boolean;
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
      // 모든 HTTP 에러를 catch 블록에서 처리하도록 throw
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get room info failed, using mock data:', error);
    // API 실패 시 mock 데이터 반환
    return {
      roomId: roomId,
      playerCount: 1,
      maxPlayers: 4,
      status: 'waiting'
    };
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

export async function updateRoomStatus(roomId: string, status: 'waiting' | 'playing' | 'finished'): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Update room status failed:', error);
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

export async function getFinishedRooms(limit: number = 10, cursor?: string): Promise<PaginatedRoomsResponse> {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append('cursor', cursor);
    
    const response = await fetch(`${API_BASE_URL}/rooms/finished?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get finished rooms failed:', error);
    return { rooms: [], hasMore: false };
  }
}
