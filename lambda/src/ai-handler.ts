import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GameAIProcessor } from './ai/game-ai-processor';

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('🎮 게임 라운드 AI 처리 시작...');
    console.log('Lambda 환경 정보:', {
        region: process.env.AWS_REGION,
        memorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
        timeout: process.env.AWS_LAMBDA_FUNCTION_TIMEOUT
    });
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return createResponse(200, { message: 'CORS preflight' });
    }

    try {
        // Validate request
        if (!event.body) {
            throw new Error('Request body is required');
        }

        const { imageBase64 } = JSON.parse(event.body);
        
        if (!imageBase64) {
            throw new Error('imageBase64 is required');
        }

        // 환경 변수 확인
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY 환경 변수가 설정되지 않음');
        }

        // Process with AI (타임아웃 처리)
        const gameAI = new GameAIProcessor();
        
        // 25초 타임아웃 설정 (API Gateway 30초 제한 고려)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Lambda timeout - 처리 시간 초과')), 25000);
        });

        const result = await Promise.race([
            gameAI.processGameRound(imageBase64),
            timeoutPromise
        ]);

        return createResponse(200, {
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Lambda 처리 오류:', error);
        
        // 구체적인 에러 타입별 처리
        let errorMessage = (error as Error).message;
        let statusCode = 500;

        if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
            statusCode = 429;
            errorMessage = 'AI 서비스 할당량 초과 - 잠시 후 다시 시도해주세요';
        } else if (errorMessage.includes('timeout')) {
            statusCode = 408;
            errorMessage = '처리 시간 초과 - 이미지가 너무 크거나 복잡합니다';
        } else if (errorMessage.includes('not found')) {
            statusCode = 404;
            errorMessage = 'AI 모델을 찾을 수 없습니다';
        }
        
        return createResponse(statusCode, {
            success: false,
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
};
