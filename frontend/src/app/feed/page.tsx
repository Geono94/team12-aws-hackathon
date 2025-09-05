import FeedPage from '@/components/features/feed/FeedPage';
import { ArtworkItem } from '@/types/ui';

// Enhanced mock data with only like reactions
const mockArtworks: ArtworkItem[] = [
  {
    id: '1',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '고양이',
    playerCount: 4,
    createdAt: '2시간 전',
    aiModel: 'Stable Diffusion v2.1',
    reactions: [
      { type: 'like', count: 24, userReacted: false }
    ]
  },
  {
    id: '2',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '집',
    playerCount: 3,
    createdAt: '5시간 전',
    aiModel: 'DALL-E 3',
    reactions: [
      { type: 'like', count: 18, userReacted: true }
    ]
  },
  {
    id: '3',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '나무',
    playerCount: 2,
    createdAt: '1일 전',
    aiModel: 'Midjourney v6',
    reactions: [
      { type: 'like', count: 42, userReacted: false }
    ]
  },
  {
    id: '4',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '자동차',
    playerCount: 4,
    createdAt: '1일 전',
    aiModel: 'Stable Diffusion XL',
    reactions: [
      { type: 'like', count: 31, userReacted: true }
    ]
  },
  {
    id: '5',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '꽃',
    playerCount: 3,
    createdAt: '2일 전',
    aiModel: 'Leonardo AI',
    reactions: [
      { type: 'like', count: 56, userReacted: false }
    ]
  },
  {
    id: '6',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '태양',
    playerCount: 2,
    createdAt: '3일 전',
    aiModel: 'Firefly',
    reactions: [
      { type: 'like', count: 13, userReacted: false }
    ]
  },
  {
    id: '7',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '강아지',
    playerCount: 4,
    createdAt: '3일 전',
    reactions: [
      { type: 'like', count: 67, userReacted: true }
    ]
  },
  {
    id: '8',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '산',
    playerCount: 3,
    createdAt: '4일 전',
    reactions: [
      { type: 'like', count: 29, userReacted: false }
    ]
  },
  {
    id: '9',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '바다',
    playerCount: 2,
    createdAt: '4일 전',
    reactions: [
      { type: 'like', count: 38, userReacted: false }
    ]
  },
  {
    id: '10',
    originalImage: '/api/placeholder/400/400',
    aiImage: '/api/placeholder/400/400',
    topic: '새',
    playerCount: 4,
    createdAt: '5일 전',
    reactions: [
      { type: 'like', count: 22, userReacted: true }
    ]
  }
];

export default function Feed() {
  return <FeedPage artworks={mockArtworks} />;
}
