import { useState, useEffect } from 'react';
import { S3_BUCKET_NAME } from '@/server/config';
import { ImageAnalysis, RoomResponse } from '@/lib/api/room';

const BUCKET_URL = `https://${S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com`;

const generateAiImageUrl = (originalUrl: string): string => {
  console.log('generateAiImageUrl input:', originalUrl);
  
  const urlParts = originalUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  const [name, extension] = filename.split('.');
  const aiFilename = `${name}_ai.${extension}`;
  urlParts[urlParts.length - 1] = aiFilename;
  
  const aiUrl = urlParts.join('/');
  console.log('generateAiImageUrl output:', aiUrl);
  
  return aiUrl;
};

const updateLoadingMessage = (attempts: number, setLoadingMessage: (msg: string) => void) => {
  if (attempts > 6) { // After 30 seconds
    setLoadingMessage('AI 이미지 생성 중... 조금 더 기다려주세요');
  }
  if (attempts > 12) { // After 1 minute
    setLoadingMessage('거의 완료되었습니다... 잠시만 더 기다려주세요');
  }
};

const checkAiImageExists = async (url: string): Promise<boolean> => {
  // Skip fetch requests due to CORS, use only image loading
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log('AI image loaded successfully');
      resolve(true);
    };
    img.onerror = () => {
      console.log('AI image failed to load');
      resolve(false);
    };
    img.src = url;
    
    // Timeout after 3 seconds
    setTimeout(() => {
      console.log('AI image check timeout');
      resolve(false);
    }, 3000);
  });
};

export const useResults = (roomId: string | null) => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [aiImage, setAiImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('AI가 이미지를 생성하고 있습니다...');
  const [roomInfo, setRoomInfo] = useState<RoomResponse>();

  const pollForAiImage = async (aiImageUrl: string, drawingResult: string) => {
    let attempts = 0;
    const maxAttempts = 18; // 1.5 minutes total (5s * 18)
    
    console.log('Starting AI image polling for:', aiImageUrl);
    
    const checkImage = async (): Promise<boolean> => {
      attempts++;
      console.log(`Checking AI image (attempt ${attempts}/${maxAttempts}):`, aiImageUrl);
      
      const exists = await checkAiImageExists(aiImageUrl);
      
      if (exists) {
        console.log('AI image found!');
        setAiImage(aiImageUrl);
        setIsLoading(false);
        return true;
      }
      
      updateLoadingMessage(attempts, setLoadingMessage);
      return false;
    };

    async function fetchRoom() {
      if (roomInfo?.analysis){return;}

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const room = await response.json();
      setRoomInfo(room);
    };
    
    // Check immediately
    const success = await checkImage();
    if (success) return;
    
    // Poll every 5 seconds
    const interval = setInterval(async () => {
      fetchRoom();
      const success = await checkImage();
      if (success || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!success) {
          console.log('AI image not found after max attempts, using fallback');
          // Fallback: use original image as AI image
          setAiImage(drawingResult);
        }
        setIsLoading(false);
      }
    }, 5000);
  };

  const loadFromLocalStorage = (drawingResult: string) => {
    console.log('Loading from localStorage, drawingResult:', drawingResult);
    setOriginalImage(drawingResult);
    
    const aiImageUrl = generateAiImageUrl(drawingResult);
    console.log('Generated AI image URL:', aiImageUrl);
    
    pollForAiImage(aiImageUrl, drawingResult);
  };

  const loadFromS3 = (roomId: string) => {
    const originalUrl = `${BUCKET_URL}/drawings/${roomId}.png`;
    console.log('Loading from S3, originalUrl:', originalUrl);
    
    setOriginalImage(originalUrl);
    
    // Also check for AI image in S3
    const aiImageUrl = generateAiImageUrl(originalUrl);
    console.log('Also checking for AI image in S3:', aiImageUrl);
    
    pollForAiImage(aiImageUrl, originalUrl);
  };

  const fetchResultImages = async (roomId: string) => {
    try {
      console.log('fetchResultImages called with roomId:', roomId);
      setIsLoading(true);
      
      // 게임 정보 로드
      const savedTopic = localStorage.getItem(`gameTopic_${roomId}`);
      const gameStateStr = localStorage.getItem(`gameState_${roomId}`);
      
      let topic = '자유 주제';
      let playerCount = 1;
      
      if (savedTopic) {
        topic = savedTopic;
      }
      
      if (gameStateStr) {
        try {
          const gameState = JSON.parse(gameStateStr);
          if (!savedTopic && gameState.topic) {
            topic = gameState.topic;
          }
          if (gameState.players?.length) {
            playerCount = gameState.players.length;
          }
        } catch (e) {
          console.log('Failed to parse game state:', e);
        }
      }
      
      const drawingResult = localStorage.getItem('drawingResult');
      console.log('drawingResult from localStorage:', drawingResult);
      
      if (drawingResult) {
        loadFromLocalStorage(drawingResult);
        return;
      }
      
      console.log('No drawingResult, loading from S3');
      loadFromS3(roomId);
    } catch (error) {
      console.error('Failed to fetch result images:', error);
      loadFromS3(roomId);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchResultImages(roomId);
    }
  }, [roomId]);

  return {
    originalImage,
    aiImage,
    isLoading,
    loadingMessage,
    roomInfo,
    imageAnalysis: JSON.parse(roomInfo?.analysis ?? 'null') as ImageAnalysis,
    topic: roomInfo?.topic??'',
  };
};
