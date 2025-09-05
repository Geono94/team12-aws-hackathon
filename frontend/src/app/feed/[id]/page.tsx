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
    reactions: [{ type: 'like', count: 24, userReacted: false }]
  },
  {
    id: '2',
    originalImage: `${S3_BUCKET_URL}/images/original2.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai2.svg`,
    topic: '집',
    playerCount: 3,
    createdAt: '5시간 전',
    aiModel: 'DALL-E 3',
    reactions: [{ type: 'like', count: 18, userReacted: true }]
  },
  {
    id: '3',
    originalImage: `${S3_BUCKET_URL}/images/original3.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai3.svg`,
    topic: '나무',
    playerCount: 2,
    createdAt: '1일 전',
    aiModel: 'Midjourney v6',
    reactions: [{ type: 'like', count: 42, userReacted: false }]
  },
  {
    id: '4',
    originalImage: `${S3_BUCKET_URL}/images/original4.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai4.svg`,
    topic: '자동차',
    playerCount: 4,
    createdAt: '1일 전',
    aiModel: 'Stable Diffusion XL',
    reactions: [{ type: 'like', count: 31, userReacted: true }]
  },
  {
    id: '5',
    originalImage: `${S3_BUCKET_URL}/images/original5.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai5.svg`,
    topic: '꽃',
    playerCount: 3,
    createdAt: '2일 전',
    aiModel: 'Leonardo AI',
    reactions: [{ type: 'like', count: 56, userReacted: false }]
  },
  {
    id: '6',
    originalImage: `${S3_BUCKET_URL}/images/original6.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai6.svg`,
    topic: '태양',
    playerCount: 2,
    createdAt: '3일 전',
    aiModel: 'Firefly',
    reactions: [{ type: 'like', count: 13, userReacted: false }]
  },
  {
    id: '7',
    originalImage: `${S3_BUCKET_URL}/images/original1.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai3.svg`,
    topic: '강아지',
    playerCount: 4,
    createdAt: '3일 전',
    aiModel: 'Stable Diffusion v2.1',
    reactions: [{ type: 'like', count: 67, userReacted: true }]
  },
  {
    id: '8',
    originalImage: `${S3_BUCKET_URL}/images/original2.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai4.svg`,
    topic: '산',
    playerCount: 3,
    createdAt: '4일 전',
    aiModel: 'DALL-E 3',
    reactions: [{ type: 'like', count: 29, userReacted: false }]
  },
  {
    id: '9',
    originalImage: `${S3_BUCKET_URL}/images/original3.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai5.svg`,
    topic: '바다',
    playerCount: 2,
    createdAt: '4일 전',
    aiModel: 'Midjourney v6',
    reactions: [{ type: 'like', count: 38, userReacted: false }]
  },
  {
    id: '10',
    originalImage: `${S3_BUCKET_URL}/images/original4.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai6.svg`,
    topic: '새',
    playerCount: 4,
    createdAt: '5일 전',
    aiModel: 'Leonardo AI',
    reactions: [{ type: 'like', count: 22, userReacted: true }]
  },
  {
    id: '11',
    originalImage: `${S3_BUCKET_URL}/images/original5.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai1.svg`,
    topic: '달',
    playerCount: 3,
    createdAt: '5일 전',
    aiModel: 'Stable Diffusion XL',
    reactions: [{ type: 'like', count: 45, userReacted: false }]
  },
  {
    id: '12',
    originalImage: `${S3_BUCKET_URL}/images/original6.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai2.svg`,
    topic: '별',
    playerCount: 2,
    createdAt: '6일 전',
    aiModel: 'Firefly',
    reactions: [{ type: 'like', count: 33, userReacted: true }]
  },
  {
    id: '13',
    originalImage: `${S3_BUCKET_URL}/images/original1.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai4.svg`,
    topic: '구름',
    playerCount: 4,
    createdAt: '6일 전',
    aiModel: 'DALL-E 3',
    reactions: [{ type: 'like', count: 19, userReacted: false }]
  },
  {
    id: '14',
    originalImage: `${S3_BUCKET_URL}/images/original2.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai5.svg`,
    topic: '무지개',
    playerCount: 3,
    createdAt: '1주 전',
    aiModel: 'Midjourney v6',
    reactions: [{ type: 'like', count: 78, userReacted: true }]
  },
  {
    id: '15',
    originalImage: `${S3_BUCKET_URL}/images/original3.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai6.svg`,
    topic: '나비',
    playerCount: 2,
    createdAt: '1주 전',
    aiModel: 'Leonardo AI',
    reactions: [{ type: 'like', count: 52, userReacted: false }]
  },
  {
    id: '16',
    originalImage: `${S3_BUCKET_URL}/images/original4.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai1.svg`,
    topic: '물고기',
    playerCount: 4,
    createdAt: '1주 전',
    aiModel: 'Stable Diffusion v2.1',
    reactions: [{ type: 'like', count: 41, userReacted: true }]
  },
  {
    id: '17',
    originalImage: `${S3_BUCKET_URL}/images/original5.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai2.svg`,
    topic: '로봇',
    playerCount: 3,
    createdAt: '1주 전',
    aiModel: 'Firefly',
    reactions: [{ type: 'like', count: 63, userReacted: false }]
  },
  {
    id: '18',
    originalImage: `${S3_BUCKET_URL}/images/original6.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai3.svg`,
    topic: '우주선',
    playerCount: 2,
    createdAt: '2주 전',
    aiModel: 'DALL-E 3',
    reactions: [{ type: 'like', count: 87, userReacted: true }]
  },
  {
    id: '19',
    originalImage: `${S3_BUCKET_URL}/images/original1.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai5.svg`,
    topic: '성',
    playerCount: 4,
    createdAt: '2주 전',
    aiModel: 'Stable Diffusion XL',
    reactions: [{ type: 'like', count: 95, userReacted: false }]
  },
  {
    id: '20',
    originalImage: `${S3_BUCKET_URL}/images/original2.svg`,
    aiImage: `${S3_BUCKET_URL}/images/ai6.svg`,
    topic: '용',
    playerCount: 3,
    createdAt: '2주 전',
    aiModel: 'Midjourney v6',
    reactions: [{ type: 'like', count: 124, userReacted: true }]
  }
];

export default function ArtworkDetail({ params }: { params: { id: string } }) {
  const artwork = mockArtworks.find(a => a.id === params.id);
  
  if (!artwork) {
    return <div>작품을 찾을 수 없습니다.</div>;
  }

  return <ArtworkDetailPage artwork={artwork} />;
}
