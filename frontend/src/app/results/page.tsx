'use client';

import { useState, useEffect } from 'react';
import ResultsPage from '@/components/features/results/ResultsPage';

export default function Results() {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [aiImage, setAiImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get drawing result from localStorage
    const drawingResult = localStorage.getItem('drawingResult');
    if (drawingResult) {
      setOriginalImage(drawingResult);
    }

    // Simulate AI processing
    setTimeout(() => {
      setAiImage('/api/placeholder/400/300'); // Mock AI result
      setIsLoading(false);
    }, 3000);
  }, []);

  const handlePlayAgain = () => {
    localStorage.removeItem('drawingResult');
    window.location.href = '/matching';
  };

  const handleGoHome = () => {
    localStorage.removeItem('drawingResult');
    window.location.href = '/';
  };

  return (
    <ResultsPage
      originalImage={originalImage || '/api/placeholder/400/300'}
      aiImage={aiImage}
      topic="고양이"
      playerCount={2}
      isLoading={isLoading}
      onPlayAgain={handlePlayAgain}
      onGoHome={handleGoHome}
    />
  );
}
