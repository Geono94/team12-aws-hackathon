import { BedrockImageProcessor } from '../bedrock-image-processor';
import * as fs from 'fs';

describe('BedrockImageProcessor', () => {
  let processor: BedrockImageProcessor;

  beforeAll(() => {
    processor = new BedrockImageProcessor();
  });

  describe('encodeImage', () => {
    test('should encode image to base64', () => {
      const mockImagePath = './test-image.jpg';
      const mockBuffer = Buffer.from('fake-image-data');
      
      jest.spyOn(fs, 'readFileSync').mockReturnValue(mockBuffer);
      
      const result = processor.encodeImage(mockImagePath);
      
      expect(result).toBe(mockBuffer.toString('base64'));
      expect(fs.readFileSync).toHaveBeenCalledWith(mockImagePath);
      
      (fs.readFileSync as jest.Mock).mockRestore();
    });
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

  describe('regenerateImage', () => {
    test('should be a function that accepts prompt and style', () => {
      expect(typeof processor.regenerateImage).toBe('function');
      
      // Test that it can be called with different parameter combinations
      expect(() => processor.regenerateImage('test prompt')).not.toThrow();
      expect(() => processor.regenerateImage('test prompt', 'cartoon')).not.toThrow();
    });
  });
});
