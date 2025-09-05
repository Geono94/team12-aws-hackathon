const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3();
const BUCKET_NAME = `drawtogether-test-${Date.now()}`;

async function createTestBucket() {
  try {
    // Create bucket
    await s3.createBucket({
      Bucket: BUCKET_NAME
    }).promise();
    
    console.log(`✓ Created bucket: ${BUCKET_NAME}`);
    
    // Upload sample images
    const sampleImages = [
      { 
        key: 'samples/drawing1.json', 
        content: JSON.stringify({
          gameId: 'test-game-1',
          strokes: [
            { x: 100, y: 100, color: '#FF0000', size: 5, timestamp: Date.now() },
            { x: 150, y: 150, color: '#00FF00', size: 3, timestamp: Date.now() + 100 }
          ],
          timestamp: new Date().toISOString(),
          description: 'Sample collaborative drawing - House'
        }, null, 2)
      },
      { 
        key: 'samples/drawing2.json', 
        content: JSON.stringify({
          gameId: 'test-game-2',
          strokes: [
            { x: 200, y: 200, color: '#0000FF', size: 4, timestamp: Date.now() },
            { x: 250, y: 250, color: '#FFFF00', size: 6, timestamp: Date.now() + 200 }
          ],
          timestamp: new Date().toISOString(),
          description: 'Sample collaborative drawing - Tree'
        }, null, 2)
      },
      {
        key: 'samples/ai-result1.json',
        content: JSON.stringify({
          originalImageKey: 'samples/drawing1.json',
          aiGeneratedImageUrl: 'https://example.com/ai-generated-1.png',
          style: 'watercolor',
          timestamp: new Date().toISOString(),
          description: 'AI generated watercolor style'
        }, null, 2)
      }
    ];
    
    for (const image of sampleImages) {
      await s3.upload({
        Bucket: BUCKET_NAME,
        Key: image.key,
        Body: image.content,
        ContentType: 'application/json'
      }).promise();
      
      console.log(`✓ Uploaded: ${image.key}`);
    }
    
    console.log(`\n🎉 Test bucket created successfully!`);
    console.log(`Bucket Name: ${BUCKET_NAME}`);
    console.log(`\nTo list files:`);
    console.log(`aws s3 ls s3://${BUCKET_NAME}/samples/ --recursive`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestBucket();
