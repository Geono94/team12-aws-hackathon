const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://drawtogether-test-1757052413482.s3.amazonaws.com';

console.log('S3_BUCKET_URL:', S3_BUCKET_URL);
console.log('NEXT_PUBLIC_S3_BUCKET_URL:', process.env.NEXT_PUBLIC_S3_BUCKET_URL);

export function getOriginalImageUrl(roomId: string): string {
  const url = `${S3_BUCKET_URL}/drawings/${roomId}.png`;
  console.log('Generated original image URL:', url);
  return url;
}

export function getAiImageUrl(roomId: string): string {
  const url = `${S3_BUCKET_URL}/drawings/${roomId}_ai.png`;
  console.log('Generated AI image URL:', url);
  return url;
}