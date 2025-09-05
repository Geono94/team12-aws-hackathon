import { GameAIProcessor, GameResult, GeneratedImage } from '../game-ai-processor';
import { ImageAnalysisResult, AnalysisResponse } from '../bedrock-image-processor';

const sampleDrawing = { base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==' };

// Mock dependencies
jest.mock('../bedrock-image-processor');
jest.mock('../gemini-image-processor');

describe('GameAIProcessor', () => {
    let gameAI: GameAIProcessor;

    beforeEach(() => {
        gameAI = new GameAIProcessor();
    });

    describe('analyzeDrawing', () => {
        test('should return fallback result on error', async () => {
            const mockAnalyzeImage = jest.spyOn(gameAI['bedrock'], 'analyzeImage')
                .mockRejectedValue(new Error('Mocked error'));
            
            const result: ImageAnalysisResult = await gameAI.analyzeDrawing('invalid-base64-data');
            
            expect(result.subject).toBe('알 수 없는 그림');
            expect(result.score).toBe(5);
            expect(result.mvp).toBe('창의적인 시도');
            expect(result.worst).toBe('더 명확한 표현 필요');
            
            mockAnalyzeImage.mockRestore();
        });

        test('should handle valid base64 input', async () => {
            const mockAnalysisResponse: AnalysisResponse = {
                evaluation: {
                    subject: '테스트 그림',
                    technicalEvaluation: '좋은 선',
                    creativityEvaluation: '창의적',
                    mvp: '색상이 좋음',
                    worst: '구성 개선 필요',
                    score: 8,
                    style: 'cartoon'
                },
                regenerationPrompt: 'A colorful cartoon drawing'
            };

            const mockAnalyzeImage = jest.spyOn(gameAI['bedrock'], 'analyzeImage')
                .mockResolvedValue(mockAnalysisResponse);
            
            const result: ImageAnalysisResult = await gameAI.analyzeDrawing(sampleDrawing.base64);
            
            expect(result.subject).toBe('테스트 그림');
            expect(result.score).toBe(8);
            expect(result.mvp).toBe('색상이 좋음');
            expect(result.worst).toBe('구성 개선 필요');
            expect(result.style).toBe('cartoon');
            
            mockAnalyzeImage.mockRestore();
        });
    });

    describe('processGameRoundFromFile', () => {
        test('should process game round successfully', async () => {
            const mockAnalysisResponse: AnalysisResponse = {
                evaluation: {
                    subject: '고양이',
                    technicalEvaluation: '선이 부드럽습니다',
                    creativityEvaluation: '독창적입니다',
                    mvp: '표정이 생동감 있습니다',
                    worst: '배경이 단조롭습니다',
                    score: 8,
                    style: 'cartoon'
                },
                regenerationPrompt: 'A cute cartoon cat with expressive eyes'
            };

            const mockAnalyzeImage = jest.spyOn(gameAI['bedrock'], 'analyzeImage')
                .mockResolvedValue(mockAnalysisResponse);
            
            const mockGenerateWithNova = jest.spyOn(gameAI as any, 'generateWithNova')
                .mockResolvedValue([{ type: 'nova', data: 'base64nova', success: true }]);
            
            const mockGenerateWithGemini = jest.spyOn(gameAI as any, 'generateWithGemini')
                .mockResolvedValue([{ type: 'gemini', data: 'base64gemini', success: true }]);

            const result: GameResult = await gameAI.processGameRoundFromFile('./test-image.jpg');

            expect(result.analysis.subject).toBe('고양이');
            expect(result.analysis.score).toBe(8);
            expect(result.regenerationPrompt).toBe('A cute cartoon cat with expressive eyes');
            expect(result.generatedImages).toHaveLength(2);
            expect(result.generatedImages[0]).toEqual({ type: 'nova', data: 'base64nova', success: true });
            expect(result.generatedImages[1]).toEqual({ type: 'gemini', data: 'base64gemini', success: true });

            mockAnalyzeImage.mockRestore();
            mockGenerateWithNova.mockRestore();
            mockGenerateWithGemini.mockRestore();
        });

        test('should handle generation failures gracefully', async () => {
            const mockAnalysisResponse: AnalysisResponse = {
                evaluation: {
                    subject: '테스트',
                    technicalEvaluation: '테스트',
                    creativityEvaluation: '테스트',
                    mvp: '테스트',
                    worst: '테스트',
                    score: 5,
                    style: 'test'
                },
                regenerationPrompt: 'Test prompt'
            };

            const mockAnalyzeImage = jest.spyOn(gameAI['bedrock'], 'analyzeImage')
                .mockResolvedValue(mockAnalysisResponse);
            
            const mockGenerateWithNova = jest.spyOn(gameAI as any, 'generateWithNova')
                .mockResolvedValue([{ type: 'nova', data: null, success: false }]);
            
            const mockGenerateWithGemini = jest.spyOn(gameAI as any, 'generateWithGemini')
                .mockResolvedValue([{ type: 'gemini', data: null, success: false }]);

            const result: GameResult = await gameAI.processGameRoundFromFile('./test-image.jpg');

            expect(result.generatedImages).toEqual([
                { type: 'nova', data: null, success: false },
                { type: 'gemini', data: null, success: false }
            ]);

            mockAnalyzeImage.mockRestore();
            mockGenerateWithNova.mockRestore();
            mockGenerateWithGemini.mockRestore();
        });
    });
});
