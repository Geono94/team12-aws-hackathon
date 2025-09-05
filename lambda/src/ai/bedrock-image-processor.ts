import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { readFileSync } from 'fs';

export interface ImageAnalysisResult {
    subject: string;
    score: number;
    mvp: string;
    worst: string;
    style: string;
}

export class BedrockImageProcessor {
    private client: BedrockRuntimeClient;

    constructor(region: string = 'us-east-1') {
        this.client = new BedrockRuntimeClient({ region });
    }

    encodeImage(imagePath: string): string {
        const imageBuffer = readFileSync(imagePath);
        return imageBuffer.toString('base64');
    }

    async analyzeImage(imagePath: string): Promise<string> {
        const base64Image = this.encodeImage(imagePath);
        
        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: "image/jpeg",
                            data: base64Image
                        }
                    },
                    {
                        type: "text",
                        text: `이 그림을 분석하고 다음 형식으로 평가해주세요:
                        
1. 주제/내용: 무엇을 그린 것인지
2. 기술적 평가: 선, 색상, 구성 등
3. 창의성 평가: 독창성, 표현력
4. MVP (가장 좋은 점): 
5. Worst (개선점):
6. 전체 점수: /10점
7. 재생성 스타일 제안: 어떤 스타일로 재생성하면 좋을지`
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
        return result.content[0].text;
    }

    async regenerateImage(prompt: string, style: string = "photographic"): Promise<string> {
        const payload = {
            taskType: "TEXT_IMAGE",
            textToImageParams: {
                text: `${prompt}, ${style} style, high quality, detailed`,
                negativeText: "low quality, blurry, distorted, ugly, bad anatomy"
            },
            imageGenerationConfig: {
                numberOfImages: 1,
                height: 512,
                width: 512,
                cfgScale: 7.0,
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
