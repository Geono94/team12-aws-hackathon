import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { readFileSync } from 'fs';

export interface AnalysisResponse {
    evaluation: {
        subject: string;
        technicalEvaluation: string;
        creativityEvaluation: string;
        mvp: string;
        worst: string;
        score: number;
        style: string;
    };
    regenerationPrompt: string;
}

export class BedrockImageProcessor {
    private client: BedrockRuntimeClient;

    constructor() {
        this.client = new BedrockRuntimeClient({
            region: 'us-east-1'
        });
    }

    async analyzeImage(imageBase64: string): Promise<AnalysisResponse> {
        const mediaType = 'image/png';
        
        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1500,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: mediaType,
                            data: imageBase64  // 직접 사용
                        }
                    },
                    {
                        type: "text",
                        text: `이 그림을 분석하고 다음 JSON 형식으로 응답해주세요:

{
  "evaluation": {
    "subject": "무엇을 그린 것인지",
    "technicalEvaluation": "선, 색상, 구성 등 기술적 평가",
    "creativityEvaluation": "독창성, 표현력 평가",
    "mvp": "가장 좋은 점",
    "worst": "개선점",
    "score": 10점 만점 점수(숫자),
    "style": "그림의 스타일 (예: 수채화, 만화, 사실적, 추상적 등)"
  },
  "regenerationPrompt": "AI 이미지 재생성용 상세 프롬프트 (영어로)"
}

반드시 위 JSON 형식으로만 응답해주세요.`
                    }
                ]
            }]
        };

        const command = new InvokeModelCommand({
            modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
            body: JSON.stringify(payload)
        });

        const response = await this.client.send(command);
        if (!response.body) {
            throw new Error('Empty response from Bedrock');
        }
        
        const result = JSON.parse(new TextDecoder().decode(response.body));
        const analysisText = result.content[0].text;
        
        try {
            return JSON.parse(analysisText);
        } catch (error) {
            console.error('JSON 파싱 실패:', analysisText);
            throw new Error('Invalid JSON response from Claude');
        }
    }

    async regenerateImageFromFileWithSettings(prompt: string, originalImagePath: string, similarity: number, cfgScale: number): Promise<string> {
        const imageBuffer = readFileSync(originalImagePath);
        
        const payload = {
            taskType: "IMAGE_VARIATION",
            imageVariationParams: {
                text: prompt,
                images: [imageBuffer.toString('base64')],
                negativeText: "inappropriate content, violence, adult content",
                similarityStrength: similarity
            },
            imageGenerationConfig: {
                numberOfImages: 1,
                quality: "standard",
                height: 512,
                width: 512,
                cfgScale: cfgScale,
                seed: Math.floor(Math.random() * 1000000)
            }
        };

        const command = new InvokeModelCommand({
            modelId: "amazon.nova-canvas-v1:0",
            body: JSON.stringify(payload)
        });

        const response = await this.client.send(command);
        if (!response.body) {
            throw new Error('Empty response from Bedrock');
        }
        
        const result = JSON.parse(new TextDecoder().decode(response.body));
        return result.images[0];
    }
}
