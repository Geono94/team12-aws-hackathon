import {BedrockImageProcessor, ImageAnalysisResult, AnalysisResponse} from './bedrock-image-processor';
import {GeminiImageProcessor} from './gemini-image-processor';
import {writeFileSync, unlinkSync, existsSync} from 'fs';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export interface GameResult {
    analysis: ImageAnalysisResult;
    fullAnalysis?: AnalysisResponse;
    regenerationPrompt?: string;
    generatedImages: GeneratedImage[];
    timestamp: string;
}

export interface GeneratedImage {
    type: 'gemini';
    data: string | null; // base64 데이터
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

    async processS3Image(request: S3ImageProcessRequest): Promise<void> {
        console.log('S3 이미지 처리 시작 (Gemini만 사용):', request);
        
        try {
            // Download image from S3
            const s3Object = await s3.getObject({
                Bucket: request.bucketName,
                Key: request.inputKey
            }).promise();

            if (!s3Object.Body) {
                throw new Error('S3 객체가 비어있습니다');
            }

            const imageBuffer = s3Object.Body as Buffer;
            const imageBase64 = imageBuffer.toString('base64');

            // Process with Gemini only
            const generatedImage = await this.gemini.generateImage(imageBase64, 'drawing');
            
            if (typeof generatedImage === 'object' && generatedImage !== null && (generatedImage as any).success && (generatedImage as any).data) {
                const outputKey = request.outputKey.replace('_ai.', '_ai.');
                
                await s3.putObject({
                    Bucket: request.bucketName,
                    Key: outputKey,
                    Body: Buffer.from((generatedImage as any).data, 'base64'),
                    ContentType: 'image/png'
                }).promise();
                
                console.log(`AI 처리된 이미지 업로드 완료: ${outputKey}`);
            } else if (typeof generatedImage === 'string') {
                const outputKey = request.outputKey.replace('_ai.', '_ai.');
                
                await s3.putObject({
                    Bucket: request.bucketName,
                    Key: outputKey,
                    Body: Buffer.from(generatedImage, 'base64'),
                    ContentType: 'image/png'
                }).promise();
                
                console.log(`AI 처리된 이미지 업로드 완료: ${outputKey}`);
            }

        } catch (error) {
            console.error('S3 이미지 처리 실패:', error);
            throw error;
        }
    }

    async analyzeDrawing(imageBase64: string): Promise<ImageAnalysisResult> {
        let tempPath: string | null = null;

        try {
            tempPath = `./temp_${Date.now()}.jpg`;

            const imageBuffer = Buffer.from(imageBase64, 'base64');
            writeFileSync(tempPath, imageBuffer);

            const analysisResponse = await this.bedrock.analyzeImage(tempPath);
            return {
                subject: analysisResponse.evaluation.subject,
                style: analysisResponse.evaluation.style,
                quality: analysisResponse.evaluation.score,
                description: `${analysisResponse.evaluation.mvp}. ${analysisResponse.evaluation.worst}`,
                score: analysisResponse.evaluation.score,
                mvp: analysisResponse.evaluation.mvp,
                worst: analysisResponse.evaluation.worst
            };

        } catch (error) {
            console.error('AI 분석 오류:', error);
            return this.getFallbackAnalysis();
        } finally {
            if (tempPath) {
                try {
                    unlinkSync(tempPath);
                } catch {
                    // Ignore cleanup errors
                }
            }
        }
    }

    async analyzeDrawingFromFile(imagePath: string): Promise<ImageAnalysisResult> {
        console.log('🔍 Bedrock으로 이미지 분석 중...');

        try {
            const analysis = await this.bedrock.analyzeImage(imagePath);
            return this.parseAnalysisForGame(analysis);

        } catch (error) {
            console.error('AI 분석 오류:', error);
            throw error;
        }
    }

    async processGameRoundFromFile(imagePath: string): Promise<GameResult> {
        console.log('🎮 게임 라운드 AI 처리 시작 (파일 경로)...');

        // 1. Claude Opus로 분석 + 재생성 프롬프트 한번에 생성 (JSON)
        const fullAnalysis = await this.bedrock.analyzeImage(imagePath);
        console.log('📊 Claude 분석 결과:', JSON.stringify(fullAnalysis, null, 2));

        // 2. JSON에서 데이터 추출
        const regenerationPrompt = fullAnalysis.regenerationPrompt;
        const analysis: ImageAnalysisResult = {
            subject: fullAnalysis.evaluation.subject,
            style: fullAnalysis.evaluation.style,
            quality: fullAnalysis.evaluation.score,
            description: `${fullAnalysis.evaluation.mvp}. ${fullAnalysis.evaluation.worst}`,
            score: fullAnalysis.evaluation.score,
            mvp: fullAnalysis.evaluation.mvp,
            worst: fullAnalysis.evaluation.worst
        };

        // 3. Nova Canvas로 이미지 생성
        const regeneratedImages: any[] = []; // await this.generateWithNova(regenerationPrompt, imagePath);

        // 4. Gemini로 이미지 생성
        const geminiImages = await this.generateWithGemini(regenerationPrompt, imagePath);

        return {
            analysis,
            fullAnalysis,
            regenerationPrompt,
            generatedImages: [...regeneratedImages, ...geminiImages],
            timestamp: new Date().toISOString()
        };
    }

    private async generateWithNova(prompt: string, imagePath: string): Promise<GeneratedImage[]> {
        try {
            const result = await this.bedrock.regenerateImageFromFileWithSettings(
                prompt,
                imagePath,
                0.7,
                6.0
            );
            
            if (result) {
                console.log('✅ Nova Canvas 이미지 생성 완료');
                return [{
                    type: 'gemini',
                    data: result, // base64 데이터 직접 반환
                    success: true
                }];
            } else {
                return [{
                    type: 'gemini',
                    data: null,
                    success: false
                }];
            }
        } catch (error: any) {
            console.error('Nova Canvas 생성 실패:', error.message);
            return [{
                type: 'gemini',
                data: null,
                success: false
            }];
        }
    }

    private async generateWithGemini(prompt: string, imagePath: string): Promise<GeneratedImage[]> {
        try {
            const geminiResult = await this.gemini.generateImage(prompt, imagePath);
            return [{
                type: 'gemini',
                data: geminiResult, // base64 데이터 또는 null
                success: geminiResult !== null
            }];
        } catch (error: any) {
            console.error('Gemini 생성 실패:', error.message);
            return [{
                type: 'gemini',
                data: null,
                success: false
            }];
        }
    }

    private getFallbackAnalysis(): ImageAnalysisResult {
        return {
            subject: "알 수 없는 그림",
            quality: 5,
            description: "창의적인 시도가 돋보이는 작품",
            score: 5,
            mvp: "창의적인 시도",
            worst: "더 명확한 표현 필요",
            style: "artistic"
        };
    }

    parseAnalysisForGame(analysisResponse: AnalysisResponse): ImageAnalysisResult {
        return {
            subject: analysisResponse.evaluation.subject,
            quality: analysisResponse.evaluation.score,
            description: `${analysisResponse.evaluation.mvp}. ${analysisResponse.evaluation.worst}`,
            score: analysisResponse.evaluation.score,
            mvp: analysisResponse.evaluation.mvp,
            worst: analysisResponse.evaluation.worst,
            style: analysisResponse.evaluation.style
        };
    }

    async processGameRound(drawingBase64: string): Promise<GameResult> {
        console.log('🎮 게임 라운드 AI 처리 시작 (base64)...');

        // 임시 파일로 저장
        const tempPath = `./temp_${Date.now()}.jpg`;
        const imageBuffer = Buffer.from(drawingBase64.replace(/^data:image\/[^;]+;base64,/, ''), 'base64');
        writeFileSync(tempPath, imageBuffer);

        try {
            const result = await this.processGameRoundFromFile(tempPath);
            return result;
        } finally {
            // 임시 파일 삭제
            if (existsSync(tempPath)) {
                unlinkSync(tempPath);
            }
        }
    }
}
