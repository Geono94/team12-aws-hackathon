'use client';

import HomePage from '@/components/features/home/HomePage';

export default function Home() {
  const handleStartGame = () => {
    // Navigate to matching page
    window.location.href = '/matching';
  };

  return (
    <HomePage 
      onStartGame={handleStartGame}
    />
  );
}
