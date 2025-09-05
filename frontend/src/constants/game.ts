export const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  DRAWING_TIME: 30000, // 30 seconds
  COUNTDOWN_TIME: 3000, // 3 seconds
  CANVAS_SIZE: {
    width: 800,
    height: 600,
  },
} as const;

export const DRAWING_TOPICS = [
  'cat', 'house', 'tree', 'car', 'flower', 
  'sun', 'dog', 'bird', 'mountain', 'ocean'
] as const;

export const GAME_STATES = {
  WAITING: 'waiting',
  COUNTDOWN: 'countdown',
  DRAWING: 'drawing',
  PROCESSING: 'processing',
  RESULTS: 'results',
} as const;
