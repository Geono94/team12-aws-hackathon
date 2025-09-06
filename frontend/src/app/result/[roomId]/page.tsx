'use client';

import ResultsPage from '@/components/features/results/ResultsPage';

export default function ResultPage({ params }: { params: Promise<{ roomId: string }> }) {
  return <ResultsPage params={params} />;
}
