#!/bin/bash

echo "🚀 Lambda 함수 배포 시작..."

# TypeScript 컴파일
echo "📦 TypeScript 컴파일 중..."
npm run build

# 기존 zip 파일 삭제
rm -f lambda-code.zip

# Lambda 코드 압축
echo "📦 Lambda 코드 압축 중..."
zip -r lambda-code.zip dist/ node_modules/ package.json

# AI Handler 함수 업데이트
echo "🔄 AI Handler 함수 업데이트 중..."
aws lambda update-function-code \
  --function-name DrawTogetherStack-AIHandler5D68B6F1-PRaQkcLFvN7n \
  --zip-file fileb://lambda-code.zip \
  --region us-east-1

# S3 Trigger Handler 함수 업데이트  
echo "🔄 S3 Trigger Handler 함수 업데이트 중..."
aws lambda update-function-code \
  --function-name DrawTogetherStack-S3TriggerHandlerBEBA31D4-oxnF5xhPMvAq \
  --zip-file fileb://lambda-code.zip \
  --region us-east-1

echo "✅ Lambda 함수 배포 완료!"
