'use client';

import HomePage from '@/components/features/home/HomePage';
import { joinRoom } from '@/lib/api/room';
import { savePlayer, getPlayer, updatePlayerRoom } from '@/lib/player';

export default function Home() {
  const handleStartGame = async (playerName: string) => {
    try {
      // 기존 플레이어 확인
      const existingPlayer = getPlayer();
      
      // 이미 방에 참여 중인지 확인
      if (existingPlayer?.currentRoomId) {
        // 기존 방으로 리다이렉트
        window.location.href = `/drawing/${existingPlayer.currentRoomId}`;
        return;
      }

      // 새 플레이어 정보 저장 또는 기존 플레이어 사용
      const player = existingPlayer?.name === playerName 
        ? existingPlayer 
        : savePlayer(playerName);

      // 방 참여 API 호출
      const roomData = await joinRoom(player.id, player.name);
      
      // 플레이어의 현재 방 정보 업데이트
      updatePlayerRoom(roomData.roomId);
      
      // 드로잉 페이지로 이동
      window.location.href = `/drawing/${roomData.roomId}`;
    } catch (error) {
      console.error('Failed to join room:', error);
      
      // 에러 시 fallback 방 생성
      const player = getPlayer() || savePlayer(playerName);
      const fallbackRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      updatePlayerRoom(fallbackRoomId);
      window.location.href = `/drawing/${fallbackRoomId}`;
    }
  };

  return (
    <HomePage 
      onStartGame={handleStartGame}
    />
  );
}
