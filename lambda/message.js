const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const apigateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_ENDPOINT
});

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const message = JSON.parse(event.body);
  
  try {
    switch (message.action) {
      case 'joinGame':
        await handleJoinGame(connectionId, message);
        break;
      case 'draw':
        await handleDraw(connectionId, message);
        break;
      case 'startGame':
        await handleStartGame(connectionId, message);
        break;
      default:
        console.log('Unknown action:', message.action);
    }
    
    return { statusCode: 200 };
  } catch (error) {
    console.error('Message error:', error);
    return { statusCode: 500 };
  }
};

async function handleJoinGame(connectionId, message) {
  const { gameId } = message;
  
  // Update connection with gameId
  await dynamodb.update({
    TableName: process.env.CONNECTIONS_TABLE,
    Key: { connectionId },
    UpdateExpression: 'SET gameId = :gameId',
    ExpressionAttributeValues: { ':gameId': gameId },
  }).promise();
  
  // Add player to game
  await dynamodb.update({
    TableName: process.env.GAMES_TABLE,
    Key: { gameId },
    UpdateExpression: 'ADD players :player',
    ExpressionAttributeValues: { ':player': dynamodb.createSet([connectionId]) },
  }).promise();
}

async function handleDraw(connectionId, message) {
  const { gameId, drawData } = message;
  
  // Broadcast to all players in the game
  const game = await dynamodb.get({
    TableName: process.env.GAMES_TABLE,
    Key: { gameId },
  }).promise();
  
  if (game.Item && game.Item.players) {
    const players = game.Item.players.values;
    await Promise.all(players.map(async (playerId) => {
      if (playerId !== connectionId) {
        try {
          await apigateway.postToConnection({
            ConnectionId: playerId,
            Data: JSON.stringify({ action: 'draw', drawData }),
          }).promise();
        } catch (error) {
          console.error('Failed to send to connection:', playerId, error);
        }
      }
    }));
  }
}

async function handleStartGame(connectionId, message) {
  const { gameId } = message;
  const topics = ['cat', 'house', 'tree', 'car', 'flower', 'sun', 'dog', 'bird'];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  // Update game with topic and start time
  await dynamodb.update({
    TableName: process.env.GAMES_TABLE,
    Key: { gameId },
    UpdateExpression: 'SET topic = :topic, startTime = :startTime, gameState = :state',
    ExpressionAttributeValues: {
      ':topic': topic,
      ':startTime': Date.now(),
      ':state': 'playing',
    },
  }).promise();
  
  // Broadcast game start to all players
  const game = await dynamodb.get({
    TableName: process.env.GAMES_TABLE,
    Key: { gameId },
  }).promise();
  
  if (game.Item && game.Item.players) {
    const players = game.Item.players.values;
    await Promise.all(players.map(async (playerId) => {
      try {
        await apigateway.postToConnection({
          ConnectionId: playerId,
          Data: JSON.stringify({ 
            action: 'gameStarted', 
            topic,
            duration: 30000 // 30 seconds
          }),
        }).promise();
      } catch (error) {
        console.error('Failed to send to connection:', playerId, error);
      }
    }));
  }
}
