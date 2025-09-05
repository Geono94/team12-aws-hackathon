# DrawTogether - 실시간 협업 드로잉 AI 게임

Amazon Q Developer Hackathon으로 구현한 실시간 협업 드로잉 게임입니다. 최대 4명이 함께 그림을 그리고 AI가 새로운 스타일로 재생성해주는 엔터테이먼트 서비스입니다.

## 어플리케이션 개요

- **실시간 협업**: 최대 4명이 동시에 하나의 캔버스에 드로잉
- **AI 재생성**: Amazon Bedrock을 활용한 이미지 스타일 변환
- **모바일 최적화**: 터치 기반 직관적 UI/UX
- **완전 서버리스**: AWS CDK로 관리되는 서버리스 아키텍처

## 주요 기능

1. **룸 생성 및 참가** (최대 4명)
2. **랜덤 주제 생성** 및 3초 카운트다운
3. **30초 협업 드로잉** (실시간 동기화)
4. **AI 이미지 재생성** (Bedrock 활용)
5. **결과 평가 및 공유**
6. **S3 이미지 저장** (원본 + AI 생성)

## 리소스 배포하기

### 사전 요구사항
```bash
# AWS CLI 설치 및 구성
aws configure

# Node.js 및 AWS CDK 설치
npm install -g aws-cdk
```

### 1. 프로젝트 설정
```bash
# 의존성 설치
npm install

# CDK 부트스트랩 (최초 1회만)
cdk bootstrap
```

### 2. AWS 리소스 배포
```bash
# CDK 스택 배포
cdk deploy --all

# 배포 확인
cdk list
```

### 3. 배포 완료 후 출력 정보
배포 완료 시 다음 정보가 출력됩니다:
- **WebSocket API URL**: 실시간 통신 엔드포인트
- **REST API URL**: HTTP API 엔드포인트  
- **S3 Bucket Name**: 이미지 저장소
- **CloudFront URL**: 프론트엔드 배포 URL

## AWS 아키텍처

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   사용자    │───▶│ CloudFront   │───▶│   Amplify   │
│  (모바일)   │    │     CDN      │    │  React App  │
└─────────────┘    └──────────────┘    └─────────────┘
                                              │
                   ┌──────────────┐          │
                   │ API Gateway  │◀─────────┘
                   │  WebSocket   │
                   └──────────────┘
                          │
                   ┌──────────────┐    ┌─────────────┐
                   │   Lambda     │───▶│ DynamoDB    │
                   │  Functions   │    │ Game State  │
                   └──────────────┘    └─────────────┘
                          │
                   ┌──────────────┐    ┌─────────────┐
                   │   Bedrock    │    │     S3      │
                   │  AI Models   │    │   Images    │
                   └──────────────┘    └─────────────┘
```

## 리소스 삭제하기

### 1. CDK 스택 삭제
```bash
# 모든 스택 삭제
cdk destroy --all

# 특정 스택만 삭제
cdk destroy DrawTogetherStack
```

### 2. S3 버킷 수동 정리 (필요시)
```bash
# S3 버킷 내용 삭제 (CDK가 자동 삭제하지 않는 경우)
aws s3 rm s3://drawtogether-images-bucket --recursive
```

### 3. 삭제 확인
```bash
# 스택 상태 확인
cdk list

# AWS 콘솔에서 리소스 삭제 확인
aws cloudformation list-stacks --stack-status-filter DELETE_COMPLETE
```

## 프로젝트 기대 효과 및 예상 사용 사례

### 기대 효과
- **창의적 협업**: 실시간 공동 창작을 통한 팀워크 향상
- **AI 활용**: 생성형 AI를 통한 새로운 예술적 경험
- **접근성**: 모바일 최적화로 언제 어디서나 참여 가능

### 예상 사용 사례
- **교육**: 온라인 미술 수업, 창의력 개발 프로그램
- **엔터테이먼트**: 친구들과의 재미있는 게임 활동
- **팀 빌딩**: 회사 워크샵, 아이스브레이킹 활동
- **아트 커뮤니티**: 집단 창작 프로젝트, 예술 실험
