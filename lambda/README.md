# DrawTogether Lambda Functions

Amazon Bedrock을 활용한 AI 이미지 분석 및 재생성 Lambda 함수들

## 구조

```
lambda/
├── src/
│   ├── ai/
│   │   ├── bedrock-image-processor.ts    # Bedrock API 처리
│   │   ├── game-ai-processor.ts          # 게임 AI 로직
│   │   └── __tests__/                    # AI 테스트
│   ├── ai-handler.ts                     # Lambda 핸들러
│   └── __tests__/                        # 통합 테스트
├── dist/                                 # 빌드 결과
├── ai.js                                 # 배포용 핸들러
├── websocket.js                          # WebSocket 핸들러
├── test.http                             # HTTP 테스트
└── package.json
```

## 개발 환경 설정

### 1. 의존성 설치
```bash
cd lambda
npm install
```

### 2. 빌드
```bash
npm run build
```

### 3. 테스트
```bash
# 단위 테스트
npm test

# AI 테스트만
npm run test:ai

# 통합 테스트
npm run test:integration

# 라이브 테스트 (실제 Bedrock 호출)
npm run test:live
```

## 로컬 테스트

### 1. 로컬 서버 실행
```bash
# 프로젝트 루트에서
npm run dev
```

### 2. HTTP 테스트
- VS Code에서 `test.http` 파일 열기
- "Send Request" 버튼 클릭

### 3. 이미지 확인
```bash
# 저장된 이미지 목록
GET http://localhost:3001/temp

# 특정 이미지 확인
GET http://localhost:3001/temp/input_1725516000000.jpg
```

## Bedrock 모델

### Claude 3.5 Sonnet (이미지 분석)
- **모델 ID**: `anthropic.claude-3-5-sonnet-20240620-v1:0`
- **용도**: 그림 분석, 평가, 스타일 제안
- **입력**: Base64 이미지 + 텍스트 프롬프트
- **출력**: 분석 결과 텍스트

### Nova Canvas (이미지 생성)
- **모델 ID**: `amazon.nova-canvas-v1:0`
- **용도**: 새로운 스타일로 이미지 재생성
- **입력**: 텍스트 프롬프트 + 스타일
- **출력**: Base64 이미지

## 환경 변수

```bash
# Lambda 환경변수
IMAGES_BUCKET=drawtogether-images-bucket
GAMES_TABLE=DrawTogether-Games

# 로컬 테스트용
AWS_REGION=us-east-1
```

## API 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": {
    "analysis": {
      "subject": "그림 주제",
      "score": 8.5,
      "mvp": "가장 좋은 점",
      "worst": "개선점",
      "style": "제안 스타일"
    },
    "inputImageFile": "input_1725516000000.jpg",
    "outputImageFile": "output_1725516000000.jpg"
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 배포

```bash
# CDK로 배포
cd ..
cdk deploy

# Lambda만 업데이트
cdk deploy --hotswap
```

## 주의사항

- Bedrock 모델 접근 권한 필요 (us-east-1)
- Nova Canvas는 미리보기 상태
- 이미지 처리 시간: 2-5초
- Lambda 타임아웃: 5분
