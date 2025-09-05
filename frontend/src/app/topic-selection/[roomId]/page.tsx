'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import TopicSelection from '@/components/features/topic-selection/TopicSelection';

export default function TopicSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const handleTopicSelected = (topic: string) => {
    router.push(`/drawing/${roomId}`);
  };

  return <TopicSelection onTopicSelected={handleTopicSelected} />;
}
