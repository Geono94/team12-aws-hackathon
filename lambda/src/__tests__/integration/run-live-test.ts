#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

const checkAWSCredentials = (): boolean => {
  try {
    const result = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
    const identity = JSON.parse(result);
    console.log('✅ AWS credentials found');
    console.log('👤 Account:', identity.Account);
    console.log('🔑 User:', identity.Arn.split('/').pop());
    return true;
  } catch {
    console.log('❌ No AWS credentials found');
    console.log('💡 Run: aws configure');
    return false;
  }
};

async function runLiveTest(): Promise<void> {
  console.log('🧪 DrawTogether AI Live Test');
  console.log('=============================');
  
  if (!checkAWSCredentials()) {
    process.exit(1);
  }
  
  console.log('🚀 Testing compiled Lambda handler...\n');

  // Use compiled JS version with absolute path
  const handlerPath = path.join(__dirname, '../../../dist/ai-handler');
  const { handler } = require(handlerPath);

  const testEvent = {
    httpMethod: 'POST',
    body: JSON.stringify({
      imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    }),
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    path: '/ai/process-drawing',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: ''
  };

  try {
    console.log('📤 Sending test image to AI handler...');
    const startTime = Date.now();
    
    const result = await handler(testEvent);
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Response time: ${duration}ms\n`);
    
    console.log('📋 Response Details:');
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      const data = JSON.parse(result.body);
      console.log('✅ Success:', data.success);
      
      if (data.data) {
        console.log('\n🎯 AI Analysis Results:');
        console.log('  Subject:', data.data.analysis?.subject || 'N/A');
        console.log('  Score:', data.data.analysis?.score || 'N/A');
        console.log('  MVP:', data.data.analysis?.mvp || 'N/A');
        console.log('  Style:', data.data.analysis?.style || 'N/A');
        console.log('  Has Regenerated Image:', !!data.data.regeneratedImage);
        console.log('  Timestamp:', data.data.timestamp);
      }
      
      console.log('\n🎉 Live test PASSED!');
    } else {
      const error = JSON.parse(result.body);
      console.log('❌ Error:', error.error);
    }
    
  } catch (error) {
    console.log('💥 Test failed:', (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  runLiveTest().catch(console.error);
}
