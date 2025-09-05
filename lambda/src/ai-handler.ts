import { AnalysisResponse } from "./ai/bedrock-image-processor";
import { GameAIProcessor } from './ai/game-ai-processor';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const dynamodb = new DynamoDBClient({});

export const handler = async (event: any): Promise<any> => {
    console.log('🎮 AI 처리 시작...');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Only handle S3 trigger events
    if (event.source === 's3-trigger') {
        console.log('S3 트리거 이벤트 처리 중...');
        try {
            const processor = new GameAIProcessor();
            
            // 분석 결과를 즉시 DB에 저장하는 콜백 함수
            const saveAnalysisCallback = async (analysis: any) => {
                console.log('📊 분석 완료, 즉시 DB 저장 중...');
                await dynamodb.send(new UpdateItemCommand({
                    TableName: 'DrawTogether-Rooms',
                    Key: { roomId: { S: event.roomId } },
                    UpdateExpression: 'SET analysis = :analysis, analysisTimestamp = :timestamp, aiStatus = :status',
                    ExpressionAttributeValues: {
                        ':analysis': { S: JSON.stringify(analysis) },
                        ':timestamp': { S: new Date().toISOString() },
                        ':status': { S: 'analyzing' }
                    }
                }));
                console.log(`분석 결과 즉시 저장 완료: ${event.roomId}`);
            };
            
            const result = await processor.processS3Image({
                bucketName: event.bucketName,
                inputKey: event.inputKey,
                outputKey: event.outputKey,
                roomId: event.roomId
            }, saveAnalysisCallback);

            console.log('S3 이미지 처리 완료:', result);

            // 최종 완료 상태 업데이트
            if (result.outputUrl) {
                await dynamodb.send(new UpdateItemCommand({
                    TableName: 'DrawTogether-Rooms',
                    Key: { roomId: { S: event.roomId } },
                    UpdateExpression: 'SET aiGeneratedImageUrl = :aiUrl, aiStatus = :status, completedAt = :completedAt',
                    ExpressionAttributeValues: {
                        ':aiUrl': { S: result.outputUrl },
                        ':status': { S: 'completed' },
                        ':completedAt': { S: new Date().toISOString() }
                    }
                }));
                console.log(`AI 이미지 생성 완료 저장: ${event.roomId}`);
            }

            return result;
        } catch (error) {
            console.error('S3 이미지 처리 실패:', error);
            // 실패 상태 저장
            await dynamodb.send(new UpdateItemCommand({
                TableName: 'DrawTogether-Rooms',
                Key: { roomId: { S: event.roomId } },
                UpdateExpression: 'SET aiStatus = :status, errorMessage = :error',
                ExpressionAttributeValues: {
                    ':status': { S: 'failed' },
                    ':error': { S: error instanceof Error ? error.message : String(error) }
                }
            }));
            throw error;
        }
    }
    
    throw new Error('Unsupported event type');
};
