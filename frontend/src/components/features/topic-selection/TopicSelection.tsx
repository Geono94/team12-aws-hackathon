'use client';

import { useEffect, useState } from 'react';

const TOPICS = [
  '🏠 집', '🐱 고양이', '🌳 나무', '🚗 자동차', '🌞 태양',
  '🎂 케이크', '🌸 꽃', '🐶 강아지', '🏔️ 산', '🌊 바다',
  '🦋 나비', '🍎 사과', '🚀 로켓', '🎈 풍선', '⭐ 별',
  '🌙 달', '🐠 물고기', '🎨 팔레트', '📚 책', '☂️ 우산'
];

interface TopicSelectionProps {
  onTopicSelected: (topic: string) => void;
}

export default function TopicSelection({ onTopicSelected }: TopicSelectionProps) {
  const [currentTopic, setCurrentTopic] = useState(TOPICS[0]);
  const [isRolling, setIsRolling] = useState(true);
  const [finalTopic, setFinalTopic] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let rollInterval: NodeJS.Timeout;
    
    // 3초간 롤링
    if (isRolling) {
      rollInterval = setInterval(() => {
        setCurrentTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
      }, 100);

      setTimeout(() => {
        clearInterval(rollInterval);
        setIsRolling(false);
        const selectedTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        setFinalTopic(selectedTopic);
        setCurrentTopic(selectedTopic);
        
        // 3초 카운트다운 시작
        setTimeout(() => setCountdown(3), 500);
      }, 3000);
    }

    return () => {
      if (rollInterval) clearInterval(rollInterval);
    };
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          onTopicSelected(finalTopic);
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown, finalTopic, onTopicSelected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        {/* 제목 */}
        <h1 className="text-3xl font-bold text-white mb-8 animate-bounce">
          🎨 그림 주제 선택 🎨
        </h1>

        {/* 주제 표시 영역 */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8 min-h-[200px] flex items-center justify-center">
          <div className={`text-6xl font-bold transition-all duration-300 ${
            isRolling 
              ? 'animate-pulse scale-110' 
              : finalTopic 
                ? 'animate-bounce scale-125' 
                : ''
          }`}>
            {currentTopic}
          </div>
        </div>

        {/* 상태 메시지 */}
        <div className="text-white text-xl font-semibold mb-4">
          {isRolling && (
            <div className="animate-pulse">
              주제를 선택하고 있어요... 🎲
            </div>
          )}
          
          {!isRolling && finalTopic && countdown === 0 && (
            <div className="animate-bounce">
              주제가 결정되었어요! 🎉
            </div>
          )}
          
          {countdown > 0 && (
            <div className="space-y-2">
              <div className="animate-pulse">곧 시작됩니다!</div>
              <div className={`text-4xl font-bold animate-ping ${
                countdown === 3 ? 'text-red-300' :
                countdown === 2 ? 'text-yellow-300' :
                'text-green-300'
              }`}>
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* 진행 상태 표시 */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                (isRolling && step === 1) ||
                (finalTopic && !countdown && step === 2) ||
                (countdown > 0 && step === 3)
                  ? 'bg-white animate-pulse'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {['✨', '🎨', '🌟', '💫', '🎪'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>
    </div>
  );
}
