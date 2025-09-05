import { GameAIProcessor, GameResult } from '../game-ai-processor';
import { ImageAnalysisResult } from '../bedrock-image-processor';

const mockResponses = require('./assets/mock-responses.json');
const sampleDrawing = require('./assets/sample-drawing.json');

describe('GameAIProcessor', () => {
  let gameAI: GameAIProcessor;

  beforeAll(() => {
    gameAI = new GameAIProcessor();
  });

  describe('parseAnalysisForGame', () => {
    test('should parse cat analysis correctly', () => {
      const result: ImageAnalysisResult = gameAI.parseAnalysisForGame(mockResponses.analysisResponse.cat);

      expect(result.subject).toBe('귀여운 고양이를 그린 것입니다.');
      expect(result.score).toBe(8);
      expect(result.mvp).toBe('표정이 매우 생동감 있습니다.');
      expect(result.worst).toBe('배경이 단조롭습니다.');
      expect(result.style).toBe('watercolor');
    });

    test('should parse house analysis correctly', () => {
      const result: ImageAnalysisResult = gameAI.parseAnalysisForGame(mockResponses.analysisResponse.house);

      expect(result.subject).toBe('집을 그린 것입니다.');
      expect(result.score).toBe(6);
      expect(result.style).toBe('3d render');
    });

    test('should handle missing fields gracefully', () => {
      const result: ImageAnalysisResult = gameAI.parseAnalysisForGame("Invalid analysis text");
      
      expect(result.subject).toBe('그림');
      expect(result.score).toBe(7);
      expect(result.mvp).toBe('좋은 시도');
      expect(result.worst).toBe('개선 가능');
      expect(result.style).toBe('artistic');
    });

    test('should detect different styles correctly', () => {
      const analyses: string[] = [
        '재생성 스타일 제안: 3D 렌더링으로',
        '재생성 스타일 제안: 빈티지 포스터',
        '재생성 스타일 제안: 만화 스타일'
      ];

      const results: ImageAnalysisResult[] = analyses.map(analysis => 
        gameAI.parseAnalysisForGame(analysis)
      );

      expect(results[0].style).toBe('3d render');
      expect(results[1].style).toBe('vintage');
      expect(results[2].style).toBe('cartoon');
    });
  });

  describe('analyzeDrawing', () => {
    test('should return fallback result on error', async () => {
      const result: ImageAnalysisResult = await gameAI.analyzeDrawing('invalid-base64-data');
      
      expect(result.subject).toBe('알 수 없는 그림');
      expect(result.score).toBe(5);
      expect(result.mvp).toBe('창의적인 시도');
      expect(result.worst).toBe('더 명확한 표현 필요');
    });

    test('should handle valid base64 input', async () => {
      // Mock the bedrock processor to avoid actual API calls
      const mockAnalyzeImage = jest.spyOn(gameAI['bedrock'], 'analyzeImage')
        .mockRejectedValue(new Error('Mocked error'));
      
      const result: ImageAnalysisResult = await gameAI.analyzeDrawing(sampleDrawing.base64);
      
      // Should return fallback due to mocked error
      expect(result.subject).toBe('알 수 없는 그림');
      expect(typeof result.score).toBe('number');
      
      mockAnalyzeImage.mockRestore();
    });
  });
});
