import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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
      const { status } = JSON.parse(event.body || '{}');
      return await updateRoomStatus(roomId, status);
    }

    if (path.startsWith('/rooms/') && method === 'GET') {
      const roomId = path.split('/')[2];
      return await getRoomInfo(roomId);
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
      return await joinRoomSafely(playerId, playerName);
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

async function joinRoomSafely(playerId: string, playerName: string, maxRetries: number = 3): Promise<APIGatewayProxyResult> {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  const newPlayer: Player = {
    playerId,
    name: playerName,
    joinedAt: Date.now(),
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 1. 빈 방 찾기
      const availableRoom = await findAvailableRoom();
      
      if (availableRoom) {
        // 2. 조건부 업데이트로 안전하게 참가
        const updatedPlayers = [...(availableRoom.players || []), newPlayer];
        
        await docClient.send(new UpdateCommand({
          TableName: ROOMS_TABLE,
          Key: { roomId: availableRoom.roomId },
          UpdateExpression: 'SET playerCount = playerCount + :inc, players = :players, updatedAt = :time',
          ConditionExpression: 'playerCount < maxPlayers AND #status = :status',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':inc': 1,
            ':players': updatedPlayers,
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
            players: updatedPlayers,
          }),
        };
      } else {
        // 3. 빈 방이 없으면 새로 생성
        const newRoom = await createNewRoom(newPlayer);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            roomId: newRoom.roomId,
            playerCount: 1,
            maxPlayers: newRoom.maxPlayers,
            players: newRoom.players,
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
  const newRoom = await createNewRoom(newPlayer);
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId: newRoom.roomId,
      playerCount: 1,
      maxPlayers: newRoom.maxPlayers,
      players: newRoom.players,
    }),
  };
}

async function updateRoomStatus(roomId: string, status: 'waiting' | 'playing' | 'finished'): Promise<APIGatewayProxyResult> {
  try {
    await docClient.send(new UpdateCommand({
      TableName: ROOMS_TABLE,
      Key: { roomId },
      UpdateExpression: 'SET #status = :status, updatedAt = :time',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':time': Date.now(),
      },
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

async function createNewRoom(initialPlayer: Player): Promise<Room> {
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const room: Room = {
    roomId,
    status: 'waiting',
    playerCount: 1,
    maxPlayers: 4,
    players: [initialPlayer],
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
