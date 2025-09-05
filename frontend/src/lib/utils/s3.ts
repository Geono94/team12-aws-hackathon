const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL;

if (!S3_BUCKET_URL) {
  throw new Error('NEXT_PUBLIC_S3_BUCKET_URL environment variable is not set');
}

export function getOriginalImageUrl(roomId: string): string {
  return `${S3_BUCKET_URL}/drawings/${roomId}.png`;
}

export function getAiImageUrl(roomId: string): string {
  return `${S3_BUCKET_URL}/drawings/${roomId}_ai.png`;
}