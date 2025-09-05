import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ROOMS_TABLE = process.env.ROOMS_TABLE!;

interface Room {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  playerCount: number;
  maxPlayers: number;
  createdAt: number;
  updatedAt: number;
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

    if (path === '/rooms/join' && method === 'POST') {
      return await joinRoomSafely();
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

async function joinRoomSafely(maxRetries: number = 3): Promise<APIGatewayProxyResult> {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 1. 빈 방 찾기
      const availableRoom = await findAvailableRoom();
      
      if (availableRoom) {
        // 2. 조건부 업데이트로 안전하게 참가
        await docClient.send(new UpdateCommand({
          TableName: ROOMS_TABLE,
          Key: { roomId: availableRoom.roomId },
          UpdateExpression: 'SET playerCount = playerCount + :inc, updatedAt = :time',
          ConditionExpression: 'playerCount < maxPlayers AND #status = :status',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':inc': 1,
            ':time': Date.now(),
            ':status': 'waiting'
          },
        }));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            roomId: availableRoom.roomId,
            playerCount: availableRoom.playerCount + 1,
            maxPlayers: availableRoom.maxPlayers,
          }),
        };
      } else {
        // 3. 빈 방이 없으면 새로 생성
        const newRoom = await createNewRoom();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            roomId: newRoom.roomId,
            playerCount: 1,
            maxPlayers: newRoom.maxPlayers,
          }),
        };
      }
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.log(`Join attempt ${attempt + 1} failed, retrying...`);
        continue; // 재시도
      }
      throw error;
    }
  }

  // 재시도 실패시 새 방 생성
  const newRoom = await createNewRoom();
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId: newRoom.roomId,
      playerCount: 1,
      maxPlayers: newRoom.maxPlayers,
    }),
  };
}

async function findAvailableRoom(): Promise<Room | null> {
  const command = new QueryCommand({
    TableName: ROOMS_TABLE,
    IndexName: 'StatusIndex',
    KeyConditionExpression: '#status = :status',
    FilterExpression: 'playerCount < maxPlayers',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'waiting',
    },
    ScanIndexForward: true,
    Limit: 1,
  });

  const result = await docClient.send(command);
  return result.Items?.[0] as Room || null;
}

async function createNewRoom(): Promise<Room> {
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const room: Room = {
    roomId,
    status: 'waiting',
    playerCount: 1,
    maxPlayers: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await docClient.send(new PutCommand({
    TableName: ROOMS_TABLE,
    Item: room,
  }));

  return room;
}

async function leaveRoom(roomId: string, playerId: string): Promise<APIGatewayProxyResult> {
  try {
    await docClient.send(new UpdateCommand({
      TableName: ROOMS_TABLE,
      Key: { roomId },
      UpdateExpression: 'SET playerCount = playerCount - :dec, updatedAt = :time',
      ConditionExpression: 'playerCount > :zero',
      ExpressionAttributeValues: {
        ':dec': 1,
        ':zero': 0,
        ':time': Date.now(),
      },
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true }),
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
