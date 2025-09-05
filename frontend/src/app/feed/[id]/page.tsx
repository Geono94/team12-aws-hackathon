import ArtworkDetailPage from '@/components/features/feed/ArtworkDetailPage';
import { ArtworkItem } from '@/types/ui';

// Sample images from S3 bucket
const S3_BUCKET_URL = 'https://drawtogether-test-1757052413482.s3.amazonaws.com';

const mockArtworks: ArtworkItem[] = [
  {
    id: '1',
    originalImage: `${S3_BUCKET_URL}/images/original1.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai1.svg`,
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
    originalImage: `${S3_BUCKET_URL}/images/original2.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai2.svg`,
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
    originalImage: `${S3_BUCKET_URL}/images/original1.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai2.svg`,
    topic: '나무',
    playerCount: 2,
    createdAt: '1일 전',
    aiModel: 'Midjourney v6',
    reactions: [
      { type: 'like', count: 42, userReacted: false }
    ]
  }
];

export default function ArtworkDetail({ params }: { params: { id: string } }) {
  const artwork = mockArtworks.find(a => a.id === params.id);
  
  if (!artwork) {
    return <div>작품을 찾을 수 없습니다.</div>;
  }

  return <ArtworkDetailPage artwork={artwork} />;
}
