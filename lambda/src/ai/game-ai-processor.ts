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

    private isEmptyImage(imageBuffer: Buffer): boolean {
        // Check if image is too small (likely empty)
        if (imageBuffer.length < 1000) {
            return true;
        }

        // Simple check: if image is mostly white pixels
        // This is a basic heuristic - for more accurate detection, 
        // you might want to use image processing libraries
        const imageString = imageBuffer.toString('base64');
        
        // Check for patterns common in empty/white canvas images
        // This is a simplified approach
        const whitePatterns = [
            'AAAA', // Common white pixel pattern in base64
            'FFFF', // Another white pattern
            '/////'  // Yet another white pattern
        ];

        let whitePatternCount = 0;
        whitePatterns.forEach(pattern => {
            const matches = (imageString.match(new RegExp(pattern, 'g')) || []).length;
            whitePatternCount += matches;
        });

        // If more than 80% of patterns suggest white/empty image
        const threshold = imageString.length * 0.01; // 1% threshold
        console.log(`🔍 Empty image check - White patterns: ${whitePatternCount}, Threshold: ${threshold}`);
        
        return whitePatternCount > threshold;
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

            // Check if image is empty/blank before processing
            if (this.isEmptyImage(imageBuffer)) {
                console.log('🚫 빈 이미지 감지 - AI 생성을 건너뜁니다');
                return {
                    evaluation: {
                        subject: "빈 캔버스",
                        technicalEvaluation: "그림이 그려지지 않았음",
                        creativityEvaluation: "내용 없음",
                        mvp: "깨끗한 캔버스",
                        worst: "그림이 없음",
                        score: 0,
                        style: "빈 화면"
                    },
                    aiImageUrl: null,
                    originalImageUrl: `https://${request.bucketName}.s3.amazonaws.com/${request.inputKey}`
                };
            }

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
