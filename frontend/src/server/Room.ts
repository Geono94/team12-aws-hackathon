import WebSocket from 'ws';
import { createCanvas } from 'canvas';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { GAME_CONFIG, S3_BUCKET_NAME, TOPICS } from './config';
import { ServerToClientMessage } from '@/types';
import { drawSvgPath } from './svgDrawing';

export class PlayerInfo {
  id: string;
  name: string;
  joinedAt: string;
  ws: WebSocket;


  constructor(args: {
    id: string;
    name: string;
    joinedAt: string;
    ws: WebSocket;
  }) {
    this.id = args.id;
    this.name = args.name;
    this.joinedAt = args.joinedAt;
    this.ws = args.ws;
  }

  public send(message: ServerToClientMessage) {
    this.ws.send(JSON.stringify(message));
  }
}

export class Room {
  public id: string;
  public state: any = {};
  public players = new Map<string, PlayerInfo>();
  public connections = new Set<WebSocket>();
  public gameTimer?: NodeJS.Timeout;
  public countdownTimer?: NodeJS.Timeout;

  constructor(id: string) {
    this.id = id;
    this.state = {
      state: 'waiting',
    }
  }

  addPlayer(playerInfo: PlayerInfo) {
    console.log("[ADD Player]", this.id, playerInfo.id)
    this.players.set(playerInfo.id, playerInfo);
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  getPlayersArray(): PlayerInfo[] {
    return Array.from(this.players.values());
  }

  getPlayersForClient() {
    return Array.from(this.players.values()).map(player => ({
      id: player.id,
      name: player.name,
      joinedAt: player.joinedAt
      // WebSocket 객체는 제외
    }));
  }

  updateState(newState: any) {
    this.state = { ...this.state, ...newState };
  }

  broadcast(message: ServerToClientMessage, sender?: WebSocket) {
    for (const player of this.players.values()) {
      if (player.ws !== sender && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify({ ...message, roomId: this.id }));
      } 
    }
  }

  cleanup() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = undefined;
    }
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
    
    this.connections.clear();
    this.players.clear();
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  private async createPngFromStrokeData(strokesData: any[]) {
    const canvas = createCanvas(GAME_CONFIG.CANVAS_SIZE.width, GAME_CONFIG.CANVAS_SIZE.height);
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_SIZE.width, GAME_CONFIG.CANVAS_SIZE.height);
    
    // Draw each stroke
    strokesData.forEach((strokeData: any) => {
      if (strokeData.pathData) {
        drawSvgPath(ctx, strokeData.pathData, strokeData.color, strokeData.size);
      }
    });
    
    const buffer = canvas.toBuffer('image/png');
    const filename = `${this.id}.png`;
    
    await this.uploadToS3(buffer, filename);
    console.log(`[${this.id}] PNG created and uploaded: ${filename}`);
  }

  private async uploadToS3(buffer: Buffer, filename: string) {
    const s3Client = new S3Client({ region: 'us-east-1' });
     
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: `drawings/${filename}`,
      Body: buffer,
      ContentType: 'image/png'
    });
    
    await s3Client.send(command);

    console.log(`[${this.id}] Uploaded to S3: s3://${S3_BUCKET_NAME}/drawings/${filename}`);
  }

  async selectTopic(topic: string) {
    this.updateState({ state: 'topicSelection', topic });
    this.broadcastGameState();
    
    // Update topic in database
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://77q0bmlyb4.execute-api.us-east-1.amazonaws.com/prod';
      const response = await fetch(`${API_BASE_URL}/rooms/${this.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'playing', topic }),
      });
      
      if (response.ok) {
        console.log(`[${this.id}] Room topic updated: ${topic}`);
      } else {
        console.error(`[${this.id}] Failed to update room topic: ${response.status}`);
      }
    } catch (error) {
      console.error(`[${this.id}] Failed to update room topic:`, error);
    }
  }

  startCountdown(onComplete: () => void) {
    if (this.countdownTimer) return;
    
    let countdown = GAME_CONFIG.COUNTDOWN_TIME;
    this.updateState({ state: 'countdown', countdown });
    this.broadcastGameState();
    
    this.countdownTimer = setInterval(() => {
      countdown--;
      this.updateState({ countdown });
      this.broadcastGameState();
      
      if (countdown <= 0) {
        clearInterval(this.countdownTimer!);
        this.countdownTimer = undefined;
        onComplete();
      }
    }, 1000);
  }

  startGameTimer(onComplete: () => void) {
    let timeLeft = GAME_CONFIG.GAME_TIME;
    
    this.updateState({ state: 'playing', timeLeft });
    this.broadcast({ type: 'gameStateUpdate', data: { state: 'playing', timeLeft } });
    
    this.gameTimer = setInterval(() => {
      timeLeft--;
      this.updateState({ timeLeft });
      this.broadcast({ type: 'gameStateUpdate', data: { timeLeft } });
      
      if (timeLeft <= 0) {
        clearInterval(this.gameTimer!);
        this.gameTimer = undefined;
        onComplete();
      }
    }, 1000);
  }

  async startGame(docs: Map<string, any>) {
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    console.log(`[${this.id}] Auto-starting game with topic: ${topic}`);
    
    await this.selectTopic(topic);
 
    // TopicSelection 화면을 3초간 보여준 후 카운트다운 시작
    setTimeout(() => {
      this.startCountdown(() => {
        this.startGameTimer(() => {
          this.endGame(docs);
        });
      });
    }, GAME_CONFIG.TOPIC_SELECT_TIME * 1000); // 3초 지연
  }

  public broadcastGameState() {
    this.broadcast({ 
      type: 'gameStateUpdate', 
      data: {
        ...this.state,
        players: this.getPlayersForClient()
      }
    }); 
  }

  private async endGame(docs: Map<string, any>) {
    console.log(`[${this.id}] Game ended, reading drawing data...`);
    
    const doc = docs.get(this.id);
    if (doc) {
      const strokesArray = doc.getArray('strokes'); 
      console.log(strokesArray)

      if (strokesArray) {
        const strokesData = strokesArray.toArray();
        console.log(`[${this.id}] Found ${strokesData.length} strokes`);
        await this.createPngFromStrokeData(strokesData);
      }
    }
    
    this.updateState({ state: 'ended' });
    
    // Update room status in database
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://77q0bmlyb4.execute-api.us-east-1.amazonaws.com/prod';
      const response = await fetch(`${API_BASE_URL}/rooms/${this.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'finished' }),
      });
      
      if (response.ok) {
        console.log(`[${this.id}] Room status updated to finished`);
      } else {
        console.error(`[${this.id}] Failed to update room status: ${response.status}`);
      }
    } catch (error) {
      console.error(`[${this.id}] Failed to update room status:`, error);
    }
    
    this.broadcast({ 
      type: 'gameEnded', 
      data: { redirectTo: `/results?roomId=${this.id}` } 
    });

    this.players.clear();
  }
}