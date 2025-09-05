#!/bin/bash

echo "🚀 Lambda 함수 배포 시작..."

# TypeScript 컴파일 (상세 로그 숨김)
echo "📦 TypeScript 컴파일 중..."
npm run build > /dev/null 2>&1

# 기존 zip 파일 삭제
rm -f lambda-code.zip

# Lambda 코드 압축 (상세 로그 숨김)
echo "📦 Lambda 코드 압축 중..."
zip -r lambda-code.zip dist/ node_modules/ package.json > /dev/null 2>&1

# AI Handler 함수 업데이트
echo "🔄 AI Handler 함수 업데이트 중..."
aws lambda update-function-code \
  --function-name DrawTogetherStack-AIHandler5D68B6F1-V74BT8RuQhBi \
  --zip-file fileb://lambda-code.zip \
  --region us-east-1 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ AI Handler 업데이트 완료"
else
    echo "❌ AI Handler 업데이트 실패"
fi

# S3 Trigger Handler 함수 업데이트  
echo "🔄 S3 Trigger Handler 함수 업데이트 중..."
aws lambda update-function-code \
  --function-name DrawTogetherStack-S3TriggerHandlerBEBA31D4-KE1C7macXElK \
  --zip-file fileb://lambda-code.zip \
  --region us-east-1 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ S3 Trigger Handler 업데이트 완료"
else
    echo "❌ S3 Trigger Handler 업데이트 실패"
fi

echo "✅ Lambda 함수 배포 완료!"
