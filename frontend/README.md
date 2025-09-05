# DrawTogether Frontend

실시간 협업 드로잉 AI 게임의 프론트엔드 애플리케이션입니다.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── features/         # 기능별 컴포넌트
│   │   ├── home/         # 홈 화면
│   │   ├── matching/     # 매칭/대기실
│   │   ├── drawing/      # 드로잉 캔버스
│   │   └── results/      # 결과 화면
│   └── layout/           # 레이아웃 컴포넌트
├── hooks/                # 커스텀 훅
│   ├── game/            # 게임 상태 관리
│   ├── canvas/          # 캔버스 관련
│   └── websocket/       # WebSocket 연결
├── lib/                  # 유틸리티 및 API
│   ├── utils/           # 헬퍼 함수
│   ├── api/             # API 클라이언트
│   └── websocket/       # WebSocket 설정
├── types/               # TypeScript 타입 정의
│   ├── game.ts          # 게임 관련 타입
│   └── ui.ts            # UI 컴포넌트 타입
├── constants/           # 상수 정의
│   ├── design.ts        # 디자인 시스템
│   └── game.ts          # 게임 설정
└── styles/              # 글로벌 스타일
    └── globals.css
```

## 개발 가이드

### 컴포넌트 개발
- `components/ui/`: 재사용 가능한 기본 UI 컴포넌트
- `components/features/`: 특정 기능에 특화된 컴포넌트
- 각 컴포넌트는 TypeScript 인터페이스로 props 타입 정의

### 상태 관리
- `hooks/websocket/useWebSocket.ts`: 실시간 통신 관리

### 디자인 시스템
- `constants/design.ts`: 색상, 간격, 타이포그래피 등 디자인 토큰
- 모든 컴포넌트에서 일관된 디자인 적용

### 협업 가이드
1. 기능별로 폴더 분리되어 있어 동시 작업 가능
2. 공통 컴포넌트는 `components/ui/`에서 관리
3. 타입 정의는 `types/` 폴더에서 중앙 관리
4. 상수는 `constants/`에서 관리하여 일관성 유지

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 주요 기능

1. **홈 화면**: 게임 시작 + 최근 작품 피드
2. **매칭/대기실**: 플레이어 대기 및 게임 시작
3. **드로잉 캔버스**: 실시간 협업 그리기
4. **결과 화면**: 원본 vs AI 변환 결과 비교

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS-in-JS (인라인 스타일)
- **Real-time**: WebSocket
- **Canvas**: HTML5 Canvas API
