import { BedrockImageProcessor, ImageAnalysisResult } from './bedrock-image-processor';
import { writeFileSync, unlinkSync } from 'fs';

export interface GameResult {
    analysis: ImageAnalysisResult;
    regeneratedImage: string | null;
    timestamp: string;
}

export class GameAIProcessor {
    private bedrock: BedrockImageProcessor;

    constructor() {
        this.bedrock = new BedrockImageProcessor();
    }

    async analyzeDrawing(imageBase64: string): Promise<ImageAnalysisResult> {
        let tempPath: string | null = null;
        
        try {
            tempPath = `./temp_${Date.now()}.jpg`;
            
            const imageBuffer = Buffer.from(imageBase64, 'base64');
            writeFileSync(tempPath, imageBuffer);
            
            const analysis = await this.bedrock.analyzeImage(tempPath);
            return this.parseAnalysisForGame(analysis);
            
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

    async regenerateForGame(prompt: string, style: string = "cartoon"): Promise<string | null> {
        try {
            return await this.bedrock.regenerateImage(prompt, style);
        } catch (error) {
            console.error('AI 재생성 오류:', error);
            return null;
        }
    }

    private getFallbackAnalysis(): ImageAnalysisResult {
        return {
            subject: "알 수 없는 그림",
            score: 5,
            mvp: "창의적인 시도",
            worst: "더 명확한 표현 필요",
            style: "artistic"
        };
    }

    parseAnalysisForGame(analysis: string): ImageAnalysisResult {
        const lines = analysis.split('\n');
        
        let subject = "그림";
        let score = 7;
        let mvp = "좋은 시도";
        let worst = "개선 가능";
        let style = "artistic";
        
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            
            // Extract subject
            if (lowerLine.includes('주제') || lowerLine.includes('내용')) {
                const match = line.split(':')[1]?.trim();
                if (match) subject = match;
            }
            
            // Extract score
            if (lowerLine.includes('점수') || lowerLine.includes('/10')) {
                const scoreMatch = line.match(/(\d+)\/10/);
                if (scoreMatch) score = Math.min(10, Math.max(1, parseInt(scoreMatch[1])));
            }
            
            // Extract MVP
            if (lowerLine.includes('mvp') || lowerLine.includes('가장 좋은')) {
                const match = line.split(':')[1]?.trim();
                if (match) mvp = match;
            }
            
            // Extract worst
            if (lowerLine.includes('worst') || lowerLine.includes('개선')) {
                const match = line.split(':')[1]?.trim();
                if (match) worst = match;
            }
            
            // Extract style
            if (lowerLine.includes('스타일') || lowerLine.includes('재생성')) {
                if (lowerLine.includes('수채화')) style = "watercolor";
                else if (lowerLine.includes('3d')) style = "3d render";
                else if (lowerLine.includes('빈티지')) style = "vintage";
                else if (lowerLine.includes('만화')) style = "cartoon";
                else if (lowerLine.includes('사실적')) style = "photographic";
            }
        }
        
        return { subject, score, mvp, worst, style };
    }

    async processGameRound(drawingBase64: string): Promise<GameResult> {
        console.log('🎮 게임 라운드 AI 처리 시작...');
        
        const analysis = await this.analyzeDrawing(drawingBase64);
        
        const regenerated = await this.regenerateForGame(
            `${analysis.subject}, beautiful ${analysis.style} style`,
            analysis.style
        );
        
        return {
            analysis,
            regeneratedImage: regenerated,
            timestamp: new Date().toISOString()
        };
    }
}
