const AWS = require('aws-sdk');
const bedrock = new AWS.BedrockRuntime({ region: 'us-east-1' });
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const { gameId, imageData } = JSON.parse(event.body);
    
    // Save original image to S3
    const originalKey = `games/${gameId}/original.png`;
    await s3.putObject({
      Bucket: process.env.IMAGES_BUCKET,
      Key: originalKey,
      Body: Buffer.from(imageData.replace(/^data:image\/png;base64,/, ''), 'base64'),
      ContentType: 'image/png',
    }).promise();
    
    // Get game topic
    const game = await dynamodb.get({
      TableName: process.env.GAMES_TABLE,
      Key: { gameId },
    }).promise();
    
    const topic = game.Item?.topic || 'unknown';
    
    // Generate AI image using Bedrock
    const prompt = `Create a beautiful, artistic interpretation of "${topic}" in a modern digital art style. Make it colorful and engaging.`;
    
    const bedrockParams = {
      modelId: 'amazon.titan-image-generator-v1',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        taskType: 'TEXT_IMAGE',
        textToImageParams: {
          text: prompt,
          negativeText: 'blurry, low quality, distorted',
        },
        imageGenerationConfig: {
          numberOfImages: 1,
          quality: 'standard',
          cfgScale: 8.0,
          height: 512,
          width: 512,
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    };
    
    const bedrockResponse = await bedrock.invokeModel(bedrockParams).promise();
    const responseBody = JSON.parse(bedrockResponse.body.toString());
    const generatedImage = responseBody.images[0];
    
    // Save AI generated image to S3
    const aiKey = `games/${gameId}/ai-generated.png`;
    await s3.putObject({
      Bucket: process.env.IMAGES_BUCKET,
      Key: aiKey,
      Body: Buffer.from(generatedImage, 'base64'),
      ContentType: 'image/png',
    }).promise();
    
    // Update game with results
    await dynamodb.update({
      TableName: process.env.GAMES_TABLE,
      Key: { gameId },
      UpdateExpression: 'SET originalImage = :original, aiImage = :ai, gameState = :state',
      ExpressionAttributeValues: {
        ':original': originalKey,
        ':ai': aiKey,
        ':state': 'completed',
      },
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: true,
        originalImage: `https://${process.env.IMAGES_BUCKET}.s3.amazonaws.com/${originalKey}`,
        aiImage: `https://${process.env.IMAGES_BUCKET}.s3.amazonaws.com/${aiKey}`,
        topic,
      }),
    };
    
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'AI processing failed' }),
    };
  }
};
