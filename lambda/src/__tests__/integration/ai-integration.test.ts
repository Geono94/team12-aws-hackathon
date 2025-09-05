import { handler } from '../../ai-handler';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { execSync } from 'child_process';

describe('AI Integration Tests', () => {
  const checkAWSCredentials = (): boolean => {
    try {
      execSync('aws sts get-caller-identity', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  };

  test('should process drawing with Bedrock API', async () => {
    if (!checkAWSCredentials()) {
      console.log('⚠️  Skipping - no AWS credentials');
      return;
    }

    const event = {
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
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result).toBeDefined();
    expect(result!.statusCode).toBe(200);
    
    const data = JSON.parse(result!.body);
    expect(data.success).toBe(true);
    expect(data.data.analysis).toBeDefined();
    expect(typeof data.data.analysis.score).toBe('number');
  }, 30000);

  test('should handle CORS preflight', async () => {
    const event = {
      httpMethod: 'OPTIONS',
      body: null,
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
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result).toBeDefined();
    expect(result!.statusCode).toBe(200);
    expect(result!.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });
});
