const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();
const BUCKET_NAME = 'drawtogether-test-1757052413482';

// Create simple SVG images as test data
function createSVGImage(content, color = '#FF6B6B') {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="${color}"/>
    <text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="Arial">${content}</text>
  </svg>`;
}

async function uploadTestImages() {
  try {
    const testImages = [
      {
        key: 'images/original1.svg',
        content: createSVGImage('Original Drawing 1', '#FF6B6B'),
        contentType: 'image/svg+xml'
      },
      {
        key: 'images/ai1.svg', 
        content: createSVGImage('AI Generated 1', '#4ECDC4'),
        contentType: 'image/svg+xml'
      },
      {
        key: 'images/original2.svg',
        content: createSVGImage('Original Drawing 2', '#45B7D1'),
        contentType: 'image/svg+xml'
      },
      {
        key: 'images/ai2.svg',
        content: createSVGImage('AI Generated 2', '#96CEB4'),
        contentType: 'image/svg+xml'
      }
    ];

    for (const image of testImages) {
      await s3.upload({
        Bucket: BUCKET_NAME,
        Key: image.key,
        Body: image.content,
        ContentType: image.contentType,
        CacheControl: 'public, max-age=31536000'
      }).promise();
      
      console.log(`✓ Uploaded: ${image.key}`);
    }
    
    console.log('\n🎉 Test images created successfully!');
    console.log(`Base URL: https://${BUCKET_NAME}.s3.amazonaws.com/`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

uploadTestImages();
