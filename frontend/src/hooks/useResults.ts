import { useState, useEffect } from 'react';
import { S3_BUCKET_NAME } from '@/server/config';
import { ImageAnalysis, RoomResponse } from '@/lib/api/room';

const BUCKET_URL = `https://${S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com`;

const generateAiImageUrl = (originalUrl: string): string => {
  const urlParts = originalUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  const [name, extension] = filename.split('.');
  const aiFilename = `${name}_ai.${extension}`;
  urlParts[urlParts.length - 1] = aiFilename;
  return urlParts.join('/');
};

export const useResults = (roomId: string | null) => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [aiImage, setAiImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomResponse>();

  const pollRoomStatus = async (roomId: string) => {
    let attempts = 0;
    const maxAttempts = 36; // 3 minutes total (5s * 36)
    
    const checkRoom = async (): Promise<boolean> => {
      attempts++;
      console.log(`Checking room status (attempt ${attempts}/${maxAttempts})`);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const room = await response.json();
        setRoomInfo(room);
        
        // Set original image URL
        if (!originalImage) {
          const originalUrl = `${BUCKET_URL}/drawings/${roomId}.png`;
          setOriginalImage(originalUrl);
        }
        
        // Check if AI processing is completed
        if (room.aiStatus === 'completed') {
          console.log('AI processing completed!');
          const aiUrl = generateAiImageUrl(originalImage || `${BUCKET_URL}/drawings/${roomId}.png`);
          setAiImage(aiUrl);
          setIsLoading(false);
          return true;
        }
        
        // Start loading only if AI is still processing
        if (room.aiStatus === 'pending' || room.aiStatus === 'analyzing') {
          setIsLoading(true);
        }
        
        return false;
      } catch (error) {
        console.error('Failed to fetch room:', error);
        return false;
      }
    };
    
    // Check immediately
    const success = await checkRoom();
    if (success) return;
    
    // Poll every 5 seconds
    const interval = setInterval(async () => {
      const success = await checkRoom();
      if (success || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!success) {
          console.log('AI processing timeout, using original image');
          setAiImage(originalImage);
        }
        setIsLoading(false);
      }
    }, 5000);
  };

  useEffect(() => {
    if (roomId) {
      console.log('Starting room polling for:', roomId);
      pollRoomStatus(roomId);
    }
  }, [roomId]);

  return {
    originalImage,
    aiImage,
    isLoading,
    roomInfo,
    imageAnalysis: roomInfo?.analysis as ImageAnalysis,
    topic: roomInfo?.topic ?? '',
  };
};
