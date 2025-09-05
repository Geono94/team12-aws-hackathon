const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
  console.log('S3 trigger event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;
    
    // Extract room ID from object key (format: original/{roomId}/image.png)
    const roomId = objectKey.split('/')[1];
    
    if (!roomId) {
      console.log('No room ID found in object key:', objectKey);
      continue;
    }

    try {
      // Get room data
      const roomData = await dynamodb.get({
        TableName: process.env.ROOMS_TABLE_NAME,
        Key: { roomId }
      }).promise();

      if (!roomData.Item) {
        console.log('Room not found:', roomId);
        continue;
      }

      // Invoke AI handler
      await lambda.invoke({
        FunctionName: process.env.AI_HANDLER_NAME,
        InvocationType: 'Event',
        Payload: JSON.stringify({
          source: 's3-trigger',
          roomId,
          bucketName,
          objectKey
        })
      }).promise();

      console.log('AI handler invoked for room:', roomId);
    } catch (error) {
      console.error('Error processing S3 trigger:', error);
    }
  }
};
