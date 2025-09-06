import { readFileSync } from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiImageProcessor {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDpW7KXhCYLq-C-xTWSOKD9iKYnszEY1d8';
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateImage(prompt: string, imageBase64: string): Promise<string> {
        console.log('🎨 Gemini 이미지 생성 시작');
        console.log('📝 전달된 프롬프트:', prompt);
        console.log('🖼️ 이미지 데이터 길이:', imageBase64.length);

        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash-image-preview"
            });

            const imagePart = {
                inlineData: {
                    data: imageBase64,
                    mimeType: 'image/jpeg'
                }
            };

            const textPrompt = `You are a master cartoon artist and illustrator. Create a stunning, high-quality cartoon artwork inspired by this reference image and the following concept: "${prompt}". 

Transform this into a beautiful cartoon masterpiece with:
- Vibrant, saturated colors with perfect color harmony
- Clean, bold outlines and smooth vector-like quality
- Professional cartoon/anime art style (Disney, Pixar, Studio Ghibli quality)
- Dynamic poses and expressive character design
- Perfect lighting and shading for depth
- Image resolution: Maximum 792x632 pixels or smaller for optimized file size
- Polished, commercial-grade illustration quality
- Creative cartoon interpretation that enhances the original concept
- NO TEXT OR LETTERS in the image - create only visual artwork without any written words
- If the reference image is completely blank or empty (white canvas with no drawings), return an empty response instead of generating new content

Create this as if it were the main poster art for a blockbuster animated movie. Make it visually striking, colorful, and absolutely captivating with cartoon charm and personality.`;

            console.log('📤 Gemini generateContent API 호출 중...');
            
            const result = await model.generateContent([textPrompt, imagePart]);
            const response = result.response;

            console.log('='.repeat(80));
            console.log('📥 GEMINI generateContent 응답:');
            console.log('='.repeat(80));
            console.log('Full response:', JSON.stringify(response, null, 2));
            console.log('='.repeat(80));
            
            const candidates = response.candidates;
            if (candidates && candidates.length > 0) {
                const candidate = candidates[0];
                console.log('Candidate finish reason:', candidate.finishReason);
                
                if (candidate.content?.parts) {
                    for (let i = 0; i < candidate.content.parts.length; i++) {
                        const part = candidate.content.parts[i];
                        console.log(`Part ${i}:`, Object.keys(part));
                        
                        // 이미지 데이터 확인
                        if (part.inlineData?.data) {
                            console.log('✅ 생성된 이미지 데이터 발견!');
                            return part.inlineData.data; // base64 데이터 직접 반환
                        }
                        
                        if (part.text) {
                            console.log('📝 텍스트 응답:', part.text.substring(0, 100) + '...');
                        }
                    }
                }
            }
            
            throw new Error('Gemini did not generate image data');

        } catch (error: any) {
            console.error('❌ Gemini 이미지 생성 오류:', error);
            console.error('🔍 에러 상세 정보:');
            console.error('- Status:', error.status);
            console.error('- StatusText:', error.statusText);
            console.error('- Message:', error.message);
            console.error('- ErrorDetails:', error.errorDetails);
            
            // 할당량 초과 확인
            if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('429')) {
                console.error('🚫 Gemini API 할당량 초과');
                console.error('💡 Google AI Studio: https://aistudio.google.com/app/apikey');
            }
            
            throw error;
        }
    }
}
