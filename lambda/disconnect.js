const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  
  try {
    await dynamodb.delete({
      TableName: process.env.CONNECTIONS_TABLE,
      Key: { connectionId },
    }).promise();
    
    return { statusCode: 200 };
  } catch (error) {
    console.error('Disconnect error:', error);
    return { statusCode: 500 };
  }
};
