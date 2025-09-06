export const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  GAME_TIME: 30,  
  COUNTDOWN_TIME: 3,  
  TOPIC_SELECT_TIME: 3,
  CANVAS_SIZE: {
    width: 800,
    height: 600,
  },
} as const;

export const TOPICS = [
  '🐱 동물 농장', '👻 할로윈', '🤖 미래 도시', '🌙 우주 여행',
  '❄️ 겨울 왕국', '🐬 바다 여행', '🍽️ 주방', '🎈 히어로', '🦋 곤충 나라',
  '🌳 마법의 숲', '☀️ 우주 여행', '📚 만화', '🎨 영화'
];

export const GAME_STATES = {
  WAITING: 'waiting',
  COUNTDOWN: 'countdown',
  DRAWING: 'drawing',
  PROCESSING: 'processing',
  RESULTS: 'results',
} as const;

export const S3_BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'drawtogether-test-1757052413482';