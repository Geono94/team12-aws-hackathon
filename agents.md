# 실시간 협업 드로잉 AI 게임 서비스 MVP

## 개발 규칙

### TypeScript 우선 정책
- **모든 새로운 코드는 TypeScript로 작성**
- JavaScript는 다음 경우에만 허용:
  - CDK 진입점 (`lambda/ai.js`)
  - 레거시 호환성이 필요한 경우
  - 외부 도구 연동이 불가능한 경우
- 테스트 코드도 TypeScript (`.test.ts`) 사용

## 서비스 개요
최대 4명의 사용자가 실시간으로 협업 드로잉하고, Gen AI가 그림을 분석해 새로운 스타일로 재생성하는 엔터테이먼트 서비스

## 게임 룰

### 기본 플로우
1. **룸 생성**: 최대 4명 참여 가능
2. **주제 공개**: 랜덤 주제 표시 (3초 대기)
3. **협업 드로잉**: 30초간 모든 참가자가 동시에 그리기
4. **AI 재생성**: Gen AI가 그림 분석 후 새로운 스타일로 재생성
5. **평가 및 공유**: 원본/AI 생성 이미지 비교, 평가, 공유

### 저장 시스템
- 원본 드로잉 → S3 저장
- AI 생성 이미지 → S3 저장
- 게임 메타데이터 → DynamoDB 저장

## AWS 중심 기술 스택

### Frontend (모바일 중심)
- **AWS Amplify**: React 앱 호스팅 및 배포
- **Amazon CloudFront**: CDN으로 전역 배포
- HTML5 Canvas (터치 최적화)
- PWA (Progressive Web App)

### Backend (서버리스)
- **AWS API Gateway**: WebSocket API 및 REST API
- **AWS Lambda**: 서버리스 백엔드 로직
- **Amazon DynamoDB**: 게임 상태, 룸 정보, 메타데이터
- **Amazon S3**: 이미지 저장 (원본 + AI 생성)

### AI/ML
- **Amazon Bedrock**: 이미지 분석 및 생성 (Claude Vision + Titan Image)
- **Amazon Rekognition**: 이미지 내용 분석 보조

### 실시간 통신
- **AWS API Gateway WebSocket**: 실시간 드로잉 동기화
- **Amazon EventBridge**: 게임 이벤트 처리

### 모니터링 및 보안
- **AWS CloudWatch**: 로그 및 모니터링
- **AWS Cognito**: 사용자 인증 (선택사항)
- **AWS WAF**: 보안 및 DDoS 방어

## AWS 아키텍처

```
[모바일 사용자] → [CloudFront] → [Amplify React App]
                                        ↓
[API Gateway WebSocket] ← → [Lambda Functions] ← → [DynamoDB]
                                        ↓
[S3 Bucket] ← → [Bedrock] ← → [EventBridge] ← → [CloudWatch]
```

## Room 생성 로직

### 🎯 Room 배정 시스템

**1단계: 빈 방 찾기**
```typescript
// GSI로 status='waiting'이고 playerCount < 4인 방 검색
findAvailableRoom() // 최대 1개 반환
```

**2단계: 빈 방이 있으면**
```typescript
// 조건부 업데이트로 안전하게 참가
UpdateCommand({
  ConditionExpression: 'playerCount < maxPlayers AND status = waiting',
  UpdateExpression: 'SET playerCount = playerCount + 1'
})
```

**3단계: 빈 방이 없으면**
```typescript
// 새 방 생성
createNewRoom() // playerCount: 1, status: 'waiting'
```

### 🔄 동시성 처리
- **재시도 로직**: 3번까지 시도
- **조건부 업데이트**: Race condition 방지
- **ConditionalCheckFailedException**: 동시 접근 시 재시도

### 📊 DynamoDB 테이블 구조

**RoomsTable**
```typescript
{
  roomId: string;           // 파티션 키
  status: 'waiting' | 'playing' | 'finished';
  playerCount: number;      // GSI 정렬 키
  maxPlayers: number;       // 최대 4명
  createdAt: number;        // 타임스탬프
  updatedAt: number;        // 타임스탬프
}
```

**GSI (StatusIndex)**
- 파티션 키: `status`
- 정렬 키: `playerCount`
- 빠른 빈 방 검색 가능

## 배포 방법

### 🚀 CDK 인프라 배포

**1. 사전 준비**
```bash
# AWS CLI 설정
aws configure

# CDK CLI 설치
npm install -g aws-cdk

# 의존성 설치
cd lambda && npm install
```

**2. 배포 실행**
```bash
# 프로젝트 루트에서
npm run build  # Lambda 함수 빌드
cdk deploy --require-approval never
```

**3. 배포 결과**
```
✅ DrawTogetherStack

Outputs:
DrawTogetherStack.RestApiURL = https://77q0bmlyb4.execute-api.us-east-1.amazonaws.com/prod/
DrawTogetherStack.ImagesBucketName = drawtogether-images-339712932307-1757057469094
```

### 🔗 프론트엔드 연결

**환경 변수 설정** (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=https://77q0bmlyb4.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**API 엔드포인트**
- `POST /rooms/join` - 룸 참가/생성
- `POST /rooms/leave` - 룸 나가기
- `POST /ai/generate` - AI 이미지 생성

### 🎮 게임 플로우

**현재 구현된 플로우**
1. 홈에서 "게임 시작하기" 클릭
2. API 호출로 룸 ID 받아오기 (`joinRoom()`)
3. 바로 `/drawing/[roomId]`로 이동
4. YJS로 실시간 협업 드로잉

**Room 배정 로직**
- 빈 방 우선 배정 → 없으면 새 방 생성
- 최대 4명까지 한 방에 배정
- 안전한 동시성 제어로 Race condition 방지

## 상세 게임 플로우

```
1. 룸 생성 (4명 대기) → 2. 랜덤 주제 생성 → 3. 3초 카운트다운
                                                    ↓
8. 평가/공유 ← 7. AI 이미지 생성 ← 6. S3 저장 ← 5. 30초 협업 드로잉
```

## 구현 우선순위 (24시간)

### Phase 1 (8시간): AWS 기반 실시간 드로잉
- Amplify React 앱 설정
- API Gateway WebSocket + Lambda
- DynamoDB 게임 상태 관리
- 터치 최적화 캔버스

### Phase 2 (8시간): 게임 로직 + S3 저장
- 30초 타이머 시스템
- 4명 룸 제한 로직
- 드로잉 이미지 S3 업로드
- 게임 상태 전환

### Phase 3 (8시간): Bedrock AI 통합
- 이미지 분석 및 재생성
- AI 결과 표시 UI
- 평가 및 공유 기능
- CloudWatch 모니터링

## 최소 기능 요구사항

1. **4명 동시 드로잉**: WebSocket으로 실시간 동기화
2. **30초 제한**: 정확한 타이머 및 자동 종료
3. **AI 재생성**: Bedrock으로 스타일 변환
4. **S3 저장**: 원본 + AI 이미지 영구 보관

## 모바일 UI 플로우

```
📱 홈 화면 (룸 생성/참가)
    ↓
📱 대기실 (참가자 목록, 준비 상태)
    ↓
📱 게임 화면 (캔버스 + 도구바 + 타이머)
    ↓
📱 결과 화면 (AI 추측, 점수, 애니메이션)
```

### 핵심 모바일 기능
- **터치 드로잉**: 멀티터치, 압력 감지
- **실시간 커서**: 다른 사용자 터치 위치 표시
- **햅틱 피드백**: 게임 이벤트 시 진동
- **세로 모드 최적화**: 캔버스 + UI 영역 분할

## 구현 우선순위 (24시간)

### Phase 1 (8시간): 모바일 드로잉 + WebSocket
- 터치 최적화 캔버스 드로잉
- WebSocket 연결 및 실시간 동기화
- 모바일 반응형 UI
- 기본 룸 생성/입장

### Phase 2 (8시간): 게임화된 라운드 시스템
- 엔터테이먼트 스타일 UI
- 라운드 시작/종료 애니메이션
- 타이머 및 진행 상태 표시
- 게임 상태 관리

### Phase 3 (8시간): AI 통합 + 결과 연출
- Bedrock 연동
- 실시간 이미지 분석
- 게임화된 결과 표시 (점수, 랭킹)
- 승부 결과 애니메이션

## 최소 기능 요구사항

1. **드로잉**: 최소 2명이 동시에 그릴 수 있어야 함
2. **AI 분석**: 그림 완성 후 AI가 주제를 맞춰야 함
3. **라운드**: 시작-진행-종료 사이클이 작동해야 함
