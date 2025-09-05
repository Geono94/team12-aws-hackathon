import FeedPage from '@/components/features/feed/FeedPage';
import { ArtworkItem } from '@/types/ui';

// Mock data - replace with actual API call
const mockArtworks: ArtworkItem[] = [
  {
    id: '1',
    originalImage: '/api/placeholder/300/200',
    aiImage: '/api/placeholder/300/200',
    topic: '고양이',
    playerCount: 4,
    createdAt: '2시간 전'
  },
  {
    id: '2',
    originalImage: '/api/placeholder/300/200',
    aiImage: '/api/placeholder/300/200',
    topic: '집',
    playerCount: 3,
    createdAt: '5시간 전'
  },
  {
    id: '3',
    originalImage: '/api/placeholder/300/200',
    aiImage: '/api/placeholder/300/200',
    topic: '나무',
    playerCount: 2,
    createdAt: '1일 전'
  }
];

export default function Feed() {
  return <FeedPage artworks={mockArtworks} />;
}
