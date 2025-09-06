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
  '🐱 동물 농장', '👻 할로윈', '🤖 미래 도시', '🌙 우주 여행', '❄️ 겨울 왕국',
  '🐬 바다 여행', '🍽️ 주방', '🎈 히어로', '🦋 곤충 나라', '🌳 마법의 숲',
  '☀️ 우주 여행', '📚 만화', '🎨 영화', '🏰 중세 성', '🎪 서커스',
  '🚀 로켓 발사', '🌈 무지개 마을', '🎭 연극 무대', '🏖️ 여름 해변', '🎂 생일 파티',
  '🌸 벚꽃 축제', '🎯 스포츠 경기', '🍕 피자 가게', '🎵 음악 콘서트', '🌋 공룡 시대',
  '🎠 놀이공원', '🏔️ 산 정상', '🌊 파도타기', '🎪 마술쇼', '🍰 디저트 카페',
  '🚂 기차 여행', '🌺 열대 정글', '🎨 미술관', '🏕️ 캠핑장', '🌟 별자리',
  '🎳 볼링장', '🍜 라면 가게', '🎪 광대', '🌅 일출', '🎢 롤러코스터',
  '🍎 과일 가게'
];

export const GAME_STATES = {
  WAITING: 'waiting',
  COUNTDOWN: 'countdown',
  DRAWING: 'drawing',
  PROCESSING: 'processing',
  RESULTS: 'results',
} as const;

export const S3_BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'drawtogether-test-1757052413482';