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

        // Process with AI
        const gameAI = new GameAIProcessor();
        const result = await gameAI.processGameRound(imageBase64);

        return createResponse(200, {
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Lambda 처리 오류:', error);
        
        return createResponse(500, {
            success: false,
            error: (error as Error).message
        });
    }
};
