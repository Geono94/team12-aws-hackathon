import { S3Event } from 'aws-lambda';
import { Lambda } from 'aws-sdk';

const lambda = new Lambda();

export const handler = async (event: S3Event): Promise<void> => {
  console.log('S3 trigger event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
    // Extract room ID from object key (format: original/{roomId}/image.png)
    const pathParts = objectKey.split('/');
    const roomId = pathParts[1];
    const fileName = pathParts[pathParts.length - 1];
    
    if (!roomId || !fileName) {
      console.log('Invalid object key format:', objectKey);
      continue;
    }

    // Generate output key with AI suffix
    const fileExtension = fileName.split('.').pop();
    const baseName = fileName.replace(`.${fileExtension}`, '');
    const outputKey = `${pathParts.slice(0, -1).join('/')}/${baseName}_ai.${fileExtension}`;

    try {
      // Invoke AI handler with input and output paths
      await lambda.invoke({
        FunctionName: process.env.AI_HANDLER_NAME!,
        InvocationType: 'Event',
        Payload: JSON.stringify({
          source: 's3-trigger',
          roomId,
          bucketName,
          inputKey: objectKey,
          outputKey: outputKey,
          originalFileName: fileName
        })
      }).promise();

      console.log(`AI handler invoked for room: ${roomId}, input: ${objectKey}, output: ${outputKey}`);
    } catch (error) {
      console.error('Error processing S3 trigger:', error);
    }
  }
};
