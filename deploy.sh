#!/bin/bash

echo "🚀 Deploying CDK infrastructure..."

# CDK 배포
cd /Users/link.ahn/project/team12-aws-hackathon
npm run build
cdk deploy --require-approval never

# API Gateway URL 추출
API_URL=$(aws cloudformation describe-stacks \
  --stack-name DrawTogetherStack \
  --query 'Stacks[0].Outputs[?OutputKey==`RestApiURL`].OutputValue' \
  --output text)

if [ ! -z "$API_URL" ]; then
  echo "✅ API Gateway URL: $API_URL"
  
  # 프론트엔드 환경 변수 업데이트
  cd frontend
  sed -i '' "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$API_URL|" .env.local
  
  echo "✅ Frontend environment updated"
  echo "🎯 You can now run: npm run dev"
else
  echo "❌ Failed to get API Gateway URL"
  exit 1
fi
