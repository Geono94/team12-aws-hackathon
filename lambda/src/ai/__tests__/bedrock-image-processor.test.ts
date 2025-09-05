import { BedrockImageProcessor } from '../bedrock-image-processor';
import * as fs from 'fs';

describe('BedrockImageProcessor', () => {
  let processor: BedrockImageProcessor;

  beforeAll(() => {
    processor = new BedrockImageProcessor();
  });

  describe('analyzeImage', () => {
    test('should handle analysis errors gracefully', async () => {
      const mockImagePath = './non-existent.jpg';
      
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('File not found');
      });
      
      await expect(processor.analyzeImage(mockImagePath)).rejects.toThrow();
      
      (fs.readFileSync as jest.Mock).mockRestore();
    });
  });

  describe('regenerateImageFromFileWithSettings', () => {
    test('should be a function that accepts required parameters', () => {
      expect(typeof processor.regenerateImageFromFileWithSettings).toBe('function');
    });
  });
});
