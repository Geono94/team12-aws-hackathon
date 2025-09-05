export interface Player {
  id: string;
  name: string;
  joinedAt: string;
  currentRoomId?: string;
}

const PLAYER_STORAGE_KEY = 'drawtogether_player';

export function savePlayer(name: string, roomId?: string): Player {
  const player: Player = {
    id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name,
    joinedAt: new Date().toISOString(),
    currentRoomId: roomId
  };
  
  localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
  return player;
}

export function getPlayer(): Player | null {
  try {
    const stored = localStorage.getItem(PLAYER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function updatePlayerRoom(roomId: string): void {
  const player = getPlayer();
  if (player) {
    player.currentRoomId = roomId;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
  }
}

export function clearPlayer(): void {
  localStorage.removeItem(PLAYER_STORAGE_KEY);
}
