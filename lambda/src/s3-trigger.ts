import { S3Event, S3Handler } from 'aws-lambda';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler: S3Handler = async (event: S3Event) => {
    console.log('S3 Trigger received:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        const bucketName = record.s3.bucket.name;
        const objectKey = record.s3.object.key;
        
        console.log(`Processing S3 object: s3://${bucketName}/${objectKey}`);

        // Extract room ID from object key (drawings/{roomId}_{timestamp}.png)
        const keyParts = objectKey.split('/');
        if (keyParts.length !== 2 || keyParts[0] !== 'drawings') {
            console.log('Skipping non-drawing object:', objectKey);
            continue;
        }

        const filename = keyParts[1];
        const roomId = filename.split('_')[0];

        if (!roomId) {
            console.log('Could not extract room ID from filename:', filename);
            continue;
        }

        try {
            // Check if room exists and is in drawing phase
            const roomResponse = await dynamoClient.send(new GetItemCommand({
                TableName: process.env.ROOMS_TABLE!,
                Key: {
                    roomId: { S: roomId }
                }
            }));

            if (!roomResponse.Item) {
                console.log(`Room ${roomId} not found in database`);
                continue;
            }

            const roomStatus = roomResponse.Item.status?.S;
            if (roomStatus !== 'drawing' && roomStatus !== 'finished') {
                console.log(`Room ${roomId} is not in drawing/finished phase: ${roomStatus}`);
                continue;
            }

            // Invoke AI handler with S3 object information
            const aiPayload = {
                source: 's3-trigger',
                roomId: roomId,
                bucketName: bucketName,
                objectKey: objectKey,
                filename: filename
            };

            console.log(`Invoking AI handler for room ${roomId}`);
            
            const invokeCommand = new InvokeCommand({
                FunctionName: process.env.AI_HANDLER_FUNCTION_NAME!,
                InvocationType: 'Event', // Async invocation
                Payload: JSON.stringify(aiPayload)
            });

            await lambdaClient.send(invokeCommand);
            console.log(`Successfully triggered AI processing for room ${roomId}`);

        } catch (error) {
            console.error(`Error processing S3 trigger for room ${roomId}:`, error);
        }
    }
};
