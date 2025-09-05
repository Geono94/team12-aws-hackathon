const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  
  try {
    await dynamodb.put({
      TableName: process.env.CONNECTIONS_TABLE,
      Item: {
        connectionId,
        timestamp: Date.now(),
      },
    }).promise();
    
    return { statusCode: 200 };
  } catch (error) {
    console.error('Connect error:', error);
    return { statusCode: 500 };
  }
};
