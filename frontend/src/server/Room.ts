import WebSocket from 'ws';
import { createCanvas } from 'canvas';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { GAME_CONFIG, S3_BUCKET_NAME, TOPICS } from './config';
import { ServerToClientMessage } from '@/types';

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

  private async createPngFromSvgData(svgDrawingMap: Map<string, any>) {
    const canvas = createCanvas(GAME_CONFIG.CANVAS_SIZE.width, GAME_CONFIG.CANVAS_SIZE.height);
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_SIZE.width, GAME_CONFIG.CANVAS_SIZE.height);
    
    // Draw each player's paths
    svgDrawingMap.forEach((playerDrawing: any, playerId: string) => {
      console.log(playerDrawing, playerId);
      if (playerDrawing.paths) {
        playerDrawing.paths.forEach((pathData: string, index: number) => {
          const color = playerDrawing.colors?.[index] || '#000';
          const strokeWidth = playerDrawing.strokeWidths?.[index] || 5;
          
          // Parse SVG path and draw on canvas
          this.drawSvgPath(ctx, pathData, color, strokeWidth);
        });
      }
    });
    
    const buffer = canvas.toBuffer('image/png');
    const filename = `${this.id}.png`;
    
    await this.uploadToS3(buffer, filename);
    console.log(`[${this.id}] PNG created and uploaded: ${filename}`);
  }

  private drawSvgPath(ctx: any, pathData: string, color: string, strokeWidth: number) {
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Parse SVG path commands
    const commands = pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
    
    ctx.beginPath();
    let currentX = 0, currentY = 0;
    
    commands.forEach(cmd => {
      const type = cmd[0].toUpperCase();
      const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      
      switch (type) {
        case 'M':
          currentX = coords[0];
          currentY = coords[1];
          ctx.moveTo(currentX, currentY);
          break;
        case 'L':
          currentX = coords[0];
          currentY = coords[1];
          ctx.lineTo(currentX, currentY);
          break;
        case 'C':
          ctx.bezierCurveTo(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
          currentX = coords[4];
          currentY = coords[5];
          break;
        case 'Q':
          ctx.quadraticCurveTo(coords[0], coords[1], coords[2], coords[3]);
          currentX = coords[2];
          currentY = coords[3];
          break;
      }
    });
    
    ctx.stroke();
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

  selectTopic(topic: string) {
    this.updateState({ state: 'topicSelection', topic });
    this.broadcastGameState();
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

  startGame(docs: Map<string, any>) {
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    
    console.log(`[${this.id}] Auto-starting game with topic: ${topic}`);
    
    this.selectTopic(topic);
 
    this.startCountdown(() => {
      this.startGameTimer(() => {
        this.endGame(docs);
      });
    }); 
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
      const svgDrawingData = doc.getMap('svgDrawing');
      
      console.log(`[${this.id}] Drawing data:`, svgDrawingData);
      
      // Create PNG from SVG data
      await this.createPngFromSvgData(svgDrawingData);
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