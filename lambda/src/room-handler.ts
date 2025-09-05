import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ROOMS_TABLE = process.env.ROOMS_TABLE!;

interface Player {
  playerId: string;
  name: string;
  joinedAt: number;
}

interface Room {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  playerCount: number;
  maxPlayers: number;
  players: Player[];
  createdAt: number;
  updatedAt: number;
  topic?: string;
  finishedAt?: number;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  };

  try {
    const path = event.path;
    const method = event.httpMethod;

    if (path.startsWith('/rooms/') && path.endsWith('/status') && method === 'PUT') {
      const roomId = path.split('/')[2];
      const { status, topic } = JSON.parse(event.body || '{}');
      return await updateRoomStatus(roomId, status, topic);
    }

    if (path === '/rooms/finished' && method === 'GET') {
      return await getFinishedRooms(event);
    }

    if (path.startsWith('/rooms/') && method === 'GET') {
      const roomId = path.split('/')[2];
      return await getRoomInfo(roomId);
    }

    if (path === '/rooms/create' && method === 'POST') {
      const { roomId, playerId, playerName } = JSON.parse(event.body || '{}');
      return await createRoom(roomId, playerId, playerName);
    }

    if (path === '/rooms/join' && method === 'POST') {
      const { playerId, playerName } = JSON.parse(event.body || '{}');
      if (!playerId || !playerName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'playerId and playerName are required' }),
        };
      }
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Room join via Lambda is deprecated. Use WebSocket server.' }),
      };
    }

    if (path === '/rooms/leave' && method === 'POST') {
      const { roomId, playerId } = JSON.parse(event.body || '{}');
      return await leaveRoom(roomId, playerId);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function createRoom(roomId: string, playerId: string, playerName: string): Promise<APIGatewayProxyResult> {
  try {
    const now = Date.now();
    const room: Room = {
      roomId,
      playerCount: 1,
      maxPlayers: 4,
      status: 'waiting',
      createdAt: now,
      updatedAt: now,
      players: [{
        playerId,
        name: playerName,
        joinedAt: now
      }]
    };

    await docClient.send(new PutCommand({
      TableName: ROOMS_TABLE,
      Item: room,
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        roomId,
        playerCount: 1,
        maxPlayers: 4,
        players: room.players
      }),
    };
  } catch (error) {
    console.error('Create room error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to create room' }),
    };
  }
}

async function updateRoomStatus(roomId: string, status: 'waiting' | 'playing' | 'finished', topic?: string): Promise<APIGatewayProxyResult> {
  try {
    let updateExpression = 'SET #status = :status, updatedAt = :time';
    
    const expressionAttributeValues: any = {
      ':status': status,
      ':time': Date.now(),
    };
    
    if (topic) {
      updateExpression += ', topic = :topic';
      expressionAttributeValues[':topic'] = topic;
    }
    
    // Add finishedAt timestamp when status is finished
    if (status === 'finished') {
      updateExpression += ', finishedAt = :time';
    }

    await docClient.send(new UpdateCommand({
      TableName: ROOMS_TABLE,
      Key: { roomId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: expressionAttributeValues,
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Update room status error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to update room status' }),
    };
  }
}

async function getRoomInfo(roomId: string): Promise<APIGatewayProxyResult> {
  try {
    const command = new QueryCommand({
      TableName: ROOMS_TABLE,
      KeyConditionExpression: 'roomId = :roomId',
      ExpressionAttributeValues: {
        ':roomId': roomId,
      },
    });

    const result = await docClient.send(command);
    const room = result.Items?.[0] as Room;

    if (!room) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Room not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    };
  } catch (error) {
    console.error('Get room info error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get room info' }),
    };
  }
}

async function findAvailableRoom(): Promise<Room | null> {
  const command = new QueryCommand({
    TableName: ROOMS_TABLE,
    IndexName: 'StatusIndex',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'waiting',
    },
    ScanIndexForward: true,
    Limit: 10, // Get multiple rooms to check availability
  });

  const result = await docClient.send(command);
  
  // Filter rooms with available space and not finished
  const availableRooms = (result.Items as Room[])?.filter(room => 
    room.playerCount < room.maxPlayers && room.status === 'waiting'
  );
  
  return availableRooms?.[0] || null;
}

async function leaveRoom(roomId: string, playerId: string): Promise<APIGatewayProxyResult> {
  try {
    // First get the current room data
    const getCommand = new QueryCommand({
      TableName: ROOMS_TABLE,
      KeyConditionExpression: 'roomId = :roomId',
      ExpressionAttributeValues: {
        ':roomId': roomId,
      },
    });

    const result = await docClient.send(getCommand);
    const room = result.Items?.[0] as Room;

    if (!room) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Room not found' }),
      };
    }

    // Remove player from array
    const updatedPlayers = (room.players || []).filter(p => p.playerId !== playerId);

    await docClient.send(new UpdateCommand({
      TableName: ROOMS_TABLE,
      Key: { roomId },
      UpdateExpression: 'SET playerCount = playerCount - :dec, players = :players, updatedAt = :time',
      ConditionExpression: 'playerCount > :zero',
      ExpressionAttributeValues: {
        ':dec': 1,
        ':zero': 0,
        ':players': updatedPlayers,
        ':time': Date.now(),
      },
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        playerCount: room.playerCount - 1,
        players: updatedPlayers,
      }),
    };
  } catch (error) {
    console.error('Leave room error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to leave room' }),
    };
  }
}

async function getFinishedRooms(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Parse query parameters
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const nextToken = event.queryStringParameters?.nextToken;

    const command = new ScanCommand({
      TableName: ROOMS_TABLE,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'finished',
      },
      Limit: Math.min(limit * 3, 150), // Get more items to sort properly
      ...(nextToken && { ExclusiveStartKey: JSON.parse(Buffer.from(nextToken, 'base64').toString()) })
    });

    const result = await docClient.send(command);
    let rooms = (result.Items as Room[]) || [];

    // Sort by finishedAt descending (newest first)
    rooms.sort((a, b) => (b.finishedAt || b.createdAt || 0) - (a.finishedAt || a.createdAt || 0));
    
    // Take only the requested limit
    const limitedRooms = rooms.slice(0, limit);

    // Prepare response with pagination
    const response: any = {
      rooms: limitedRooms,
      hasMore: !!result.LastEvaluatedKey || rooms.length > limit
    };

    if (result.LastEvaluatedKey) {
      response.nextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Get finished rooms error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get finished rooms' }),
    };
  }
}
