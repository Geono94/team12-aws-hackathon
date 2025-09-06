import {BedrockImageProcessor, AnalysisResponse} from './bedrock-image-processor';
import {GeminiImageProcessor} from './gemini-image-processor';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({});

export interface GameResult {
    analysis: AnalysisResponse;
    fullAnalysis?: AnalysisResponse;
    regenerationPrompt?: string;
    generatedImages: GeneratedImage[];
    timestamp: string;
}

export interface GeneratedImage {
    type: 'gemini';
    url?: string; // S3 URL
    success: boolean;
}

export interface S3ImageProcessRequest {
    bucketName: string;
    inputKey: string;
    outputKey: string;
    roomId: string;
}

export class GameAIProcessor {
    private bedrock: BedrockImageProcessor;
    private gemini: GeminiImageProcessor;

    constructor() {
        this.bedrock = new BedrockImageProcessor();
        this.gemini = new GeminiImageProcessor();
    }

    async processS3Image(request: S3ImageProcessRequest, onAnalysisComplete?: (analysis: any) => Promise<void>): Promise<any> {
        console.log('S3 이미지 처리 시작 (Gemini만 사용):', request);
        
        try {
            // Download image from S3
            const getCommand = new GetObjectCommand({
                Bucket: request.bucketName,
                Key: request.inputKey
            });
            const s3Object = await s3.send(getCommand);

            if (!s3Object.Body) {
                throw new Error('S3 객체가 비어있습니다');
            }

            const imageBuffer = Buffer.from(await s3Object.Body.transformToByteArray());
            const imageBase64 = imageBuffer.toString('base64');

            // Analyze drawing using existing method
            const analysisResult = await this.analyzeDrawing(imageBase64);

            // Call callback immediately after analysis
            if (onAnalysisComplete) {
                await onAnalysisComplete(analysisResult.evaluation);
            }

            // Use regeneration prompt from analysis or fallback
            const prompt = analysisResult.regenerationPrompt || "";
            
            // Process with Gemini using base64 data
            const generatedImage = await this.gemini.generateImage(prompt, imageBase64);
            
            let outputUrl = '';
            if (typeof generatedImage === 'object' && generatedImage !== null && (generatedImage as any).success && (generatedImage as any).data) {
                const putCommand = new PutObjectCommand({
                    Bucket: request.bucketName,
                    Key: request.outputKey,
                    Body: Buffer.from((generatedImage as any).data, 'base64'),
                    ContentType: 'image/png'
                });
                await s3.send(putCommand);
                outputUrl = `https://${request.bucketName}.s3.us-east-1.amazonaws.com/${request.outputKey}`;
                console.log(`AI 처리된 이미지 업로드 완료: ${request.outputKey}`);
            } else if (typeof generatedImage === 'string') {
                const putCommand = new PutObjectCommand({
                    Bucket: request.bucketName,
                    Key: request.outputKey,
                    Body: Buffer.from(generatedImage, 'base64'),
                    ContentType: 'image/png'
                });
                await s3.send(putCommand);
                outputUrl = `https://${request.bucketName}.s3.us-east-1.amazonaws.com/${request.outputKey}`;
                console.log(`AI 처리된 이미지 업로드 완료: ${request.outputKey}`);
            }

            return {
                analysis: analysisResult,
                outputUrl: outputUrl
            };

        } catch (error) {
            console.error('S3 이미지 처리 실패:', error);
            throw error;
        }
    }

    async analyzeDrawing(imageBase64: string): Promise<AnalysisResponse> {
        console.log('🔍 이미지 분석 시작 (Bedrock 사용)...');

        try {
            const analysisResponse = await this.bedrock.analyzeImage(imageBase64);
            console.log('✅ Bedrock 분석 완료:', JSON.stringify(analysisResponse.evaluation, null, 2));
            return analysisResponse;

        } catch (error) {
            console.error('❌❌❌ BEDROCK 분석 완전 실패! ❌❌❌');
            console.error('실패 원인:', error);
            console.error('에러 메시지:', error instanceof Error ? error.message : String(error));
            console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace');
            console.error('🔄 Fallback 분석 사용 중...');
            
            const fallback = this.getFallbackAnalysis();
            console.log('📋 Fallback 분석 결과:', JSON.stringify(fallback.evaluation, null, 2));
            return fallback;
        }
    }

    private getFallbackAnalysis(): AnalysisResponse {
        return {
            evaluation: {
                subject: "알 수 없는 그림",
                technicalEvaluation: "기술적 평가 불가",
                creativityEvaluation: "창의성 평가 불가", 
                mvp: "창의적인 시도",
                worst: "더 명확한 표현 필요",
                score: 5,
                style: "artistic"
            },
            regenerationPrompt: ""
        };
    }
}
