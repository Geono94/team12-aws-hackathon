const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();
const BUCKET_NAME = 'drawtogether-test-1757052413482';

// Create simple SVG images as test data
function createSVGImage(content, bgColor = '#FF6B6B', textColor = '#FFFFFF') {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${adjustColor(bgColor)};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#grad)"/>
    <text x="200" y="150" text-anchor="middle" fill="${textColor}" font-size="20" font-family="Arial" font-weight="bold">${content}</text>
  </svg>`;
}

function adjustColor(color) {
  // Simple color adjustment for gradient
  const colors = {
    '#FF6B6B': '#FF8E8E',
    '#4ECDC4': '#6EDDD6',
    '#45B7D1': '#67C5E3',
    '#96CEB4': '#B8E6CC',
    '#FFEAA7': '#FFE4B5',
    '#DDA0DD': '#E6B8E6',
    '#98D8C8': '#B0E0D0'
  };
  return colors[color] || '#888888';
}

async function uploadFeedImages() {
  try {
    const topics = [
      { name: '고양이', color: '#FF6B6B' },
      { name: '집', color: '#4ECDC4' },
      { name: '나무', color: '#45B7D1' },
      { name: '자동차', color: '#96CEB4' },
      { name: '꽃', color: '#FFEAA7' },
      { name: '태양', color: '#DDA0DD' },
      { name: '강아지', color: '#98D8C8' },
      { name: '산', color: '#FF6B6B' },
      { name: '바다', color: '#4ECDC4' },
      { name: '새', color: '#45B7D1' }
    ];

    const images = [];
    
    // Create original and AI versions for each topic
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      
      // Original images (3-6)
      for (let j = 3; j <= 6; j++) {
        images.push({
          key: `images/original${j}.svg`,
          content: createSVGImage(`Original ${topic.name}`, topic.color, '#FFFFFF'),
          contentType: 'image/svg+xml'
        });
      }
      
      // AI images (3-6)  
      for (let j = 3; j <= 6; j++) {
        images.push({
          key: `images/ai${j}.svg`,
          content: createSVGImage(`AI ${topic.name}`, adjustColor(topic.color), '#000000'),
          contentType: 'image/svg+xml'
        });
      }
    }

    for (const image of images) {
      await s3.upload({
        Bucket: BUCKET_NAME,
        Key: image.key,
        Body: image.content,
        ContentType: image.contentType,
        CacheControl: 'public, max-age=31536000'
      }).promise();
      
      console.log(`✓ Uploaded: ${image.key}`);
    }
    
    console.log(`\n🎉 Feed images created successfully!`);
    console.log(`Total images: ${images.length}`);
    console.log(`Base URL: https://${BUCKET_NAME}.s3.amazonaws.com/`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

uploadFeedImages();
