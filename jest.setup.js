// Jest setup file
jest.setTimeout(30000); // 30초 타임아웃 (Bedrock API 호출용)

// AWS SDK 모킹 (실제 API 호출 방지)
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  InvokeModelCommand: jest.fn()
}));
