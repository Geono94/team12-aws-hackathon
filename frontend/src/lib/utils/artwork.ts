import { ArtworkItem } from '@/types/ui';
import { RoomResponse } from '@/lib/api/room';
import { getOriginalImageUrl, getAiImageUrl } from './s3';
import { formatTimeAgo } from './time';

export const createArtworkFromRoom = (room: RoomResponse): ArtworkItem => ({
  id: room.roomId,
  originalImage: getOriginalImageUrl(room.roomId),
  aiImage: getAiImageUrl(room.roomId),
  topic: room.topic || '알 수 없음',
  playerCount: room.playerCount,
  createdAt: room.completedAt ? formatTimeAgo(new Date(room.completedAt).getTime()) : '알 수 없음',
  aiModel: 'Amazon Bedrock',
  reactions: [{ 
    type: 'like' as const, 
    count: Math.floor(Math.random() * 100), 
    userReacted: Math.random() > 0.5 
  }]
});

export const getTotalReactions = (artwork: ArtworkItem): number => {
  return artwork.reactions.reduce((sum, r) => sum + r.count, 0);
};

export const getUserReaction = (artwork: ArtworkItem, type: 'like') => {
  return artwork.reactions.find(r => r.type === type);
};
