export const GAME_CONFIG = {
  MAX_PLAYERS: 2,
  GAME_TIME: 10, // 30 seconds
  COUNTDOWN_TIME: 3, // 3 seconds
  TOPIC_SELECTION_TIME: 3.5,
  CANVAS_SIZE: {
    width: 800,
    height: 600,
  },
} as const;

export const TOPICS = [
  '🐱 고양이', '🌸 꽃', '🏠 집', '🚗 자동차', '🌙 달',
  '⭐ 별', '🌈 무지개', '🎂 케이크', '🎈 풍선', '🦋 나비',
  '🌳 나무', '☀️ 태양', '🎵 음표', '📚 책', '🎨 팔레트'
];

export const GAME_STATES = {
  WAITING: 'waiting',
  COUNTDOWN: 'countdown',
  DRAWING: 'drawing',
  PROCESSING: 'processing',
  RESULTS: 'results',
} as const;

export const S3_BUCKET_NAME = 'drawtogether-test-1757052413482';