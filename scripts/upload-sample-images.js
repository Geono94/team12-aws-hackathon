const AWS = require('aws-sdk');

// Configure AWS region
AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3();

async function uploadSampleImages() {
  // Get bucket name from CDK outputs
  const cloudformation = new AWS.CloudFormation();
  
  try {
    const stacks = await cloudformation.describeStacks({
      StackName: 'DrawTogetherStack'
    }).promise();
    
    const outputs = stacks.Stacks[0].Outputs;
    const bucketOutput = outputs.find(o => o.OutputKey === 'ImagesBucketName');
    const bucketName = bucketOutput.OutputValue;
    
    console.log(`Uploading sample images to bucket: ${bucketName}`);
    
    const sampleImages = [
      { key: 'samples/drawing1.json', content: JSON.stringify({
        strokes: [
          { x: 100, y: 100, color: '#FF0000', size: 5 },
          { x: 150, y: 150, color: '#00FF00', size: 3 }
        ],
        timestamp: new Date().toISOString(),
        description: 'Sample drawing data'
      })},
      { key: 'samples/drawing2.json', content: JSON.stringify({
        strokes: [
          { x: 200, y: 200, color: '#0000FF', size: 4 },
          { x: 250, y: 250, color: '#FFFF00', size: 6 }
        ],
        timestamp: new Date().toISOString(),
        description: 'Another sample drawing'
      })}
    ];
    
    for (const image of sampleImages) {
      await s3.upload({
        Bucket: bucketName,
        Key: image.key,
        Body: image.content,
        ContentType: 'application/json'
      }).promise();
      
      console.log(`✓ Uploaded: ${image.key}`);
    }
    
    console.log('Sample images uploaded successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

uploadSampleImages();
