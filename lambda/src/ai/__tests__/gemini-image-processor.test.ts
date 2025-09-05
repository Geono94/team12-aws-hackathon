import { GeminiImageProcessor } from '../gemini-image-processor';
import * as fs from 'fs';

// Mock @google/generative-ai
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn()
        })
    }))
}));

// Mock fs
jest.mock('fs', () => ({
    readFileSync: jest.fn()
}));

describe('GeminiImageProcessor', () => {
    let processor: GeminiImageProcessor;
    let mockModel: any;
    let mockReadFileSync: jest.MockedFunction<typeof fs.readFileSync>;

    beforeEach(() => {
        processor = new GeminiImageProcessor();
        mockModel = (processor as any).genAI.getGenerativeModel();
        mockReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;
    });

    describe('generateImage', () => {
        test('should handle successful image generation', async () => {
            const mockResponse = {
                response: {
                    candidates: [{
                        finishReason: 'STOP',
                        content: {
                            parts: [{
                                inlineData: {
                                    data: 'base64imagedata'
                                }
                            }]
                        }
                    }]
                }
            };

            mockModel.generateContent.mockResolvedValue(mockResponse);
            mockReadFileSync.mockReturnValue(Buffer.from('fake-image'));

            const result = await processor.generateImage('test prompt', './test-image.jpg');

            expect(result).toBe('base64imagedata');
            expect(mockModel.generateContent).toHaveBeenCalledWith([
                expect.stringContaining('master cartoon artist'),
                expect.objectContaining({
                    inlineData: expect.objectContaining({
                        data: expect.any(String),
                        mimeType: 'image/jpeg'
                    })
                })
            ]);
        });

        test('should handle quota exceeded error', async () => {
            const quotaError = new Error('You exceeded your current quota');
            mockModel.generateContent.mockRejectedValue(quotaError);
            mockReadFileSync.mockReturnValue(Buffer.from('fake-image'));

            await expect(processor.generateImage('test prompt', './test-image.jpg'))
                .rejects.toThrow('You exceeded your current quota');
        });

        test('should handle no image data in response', async () => {
            const mockResponse = {
                response: {
                    candidates: [{
                        finishReason: 'STOP',
                        content: {
                            parts: [{
                                text: 'No image generated'
                            }]
                        }
                    }]
                }
            };

            mockModel.generateContent.mockResolvedValue(mockResponse);
            mockReadFileSync.mockReturnValue(Buffer.from('fake-image'));

            await expect(processor.generateImage('test prompt', './test-image.jpg'))
                .rejects.toThrow('Gemini did not generate image data');
        });

        test('should use PNG mime type for PNG files', async () => {
            const mockResponse = {
                response: {
                    candidates: [{
                        finishReason: 'STOP',
                        content: {
                            parts: [{
                                inlineData: {
                                    data: 'base64imagedata'
                                }
                            }]
                        }
                    }]
                }
            };

            mockModel.generateContent.mockResolvedValue(mockResponse);
            mockReadFileSync.mockReturnValue(Buffer.from('fake-image'));

            await processor.generateImage('test prompt', './test-image.png');

            expect(mockModel.generateContent).toHaveBeenCalledWith([
                expect.any(String),
                expect.objectContaining({
                    inlineData: expect.objectContaining({
                        mimeType: 'image/png'
                    })
                })
            ]);
        });
    });
});
