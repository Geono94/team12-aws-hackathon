import { GameAIProcessor } from '../game-ai-processor';

describe('GameAIProcessor', () => {
  let processor: GameAIProcessor;

  beforeEach(() => {
    processor = new GameAIProcessor();
  });

  describe('analyzeDrawing', () => {
    it('should return fallback analysis', async () => {
      const mockImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
      
      const result = await processor.analyzeDrawing(mockImageBase64);
      
      expect(result).toBeDefined();
      expect(result.evaluation.subject).toBe('알 수 없는 그림');
      expect(result.evaluation.score).toBe(5);
    });
  });
});
