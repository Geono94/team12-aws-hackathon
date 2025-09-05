import WebSocket from 'ws';

export class Room {
  public id: string;
  public state: any = {};
  public players = new Set<string>();
  public connections = new Set<WebSocket>();
  public gameTimer?: NodeJS.Timeout;
  public countdownTimer?: NodeJS.Timeout;

  constructor(id: string) {
    this.id = id;
  }

  addPlayer(playerId: string) {
    this.players.add(playerId);
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  addConnection(ws: WebSocket) {
    this.connections.add(ws);
  }

  removeConnection(ws: WebSocket) {
    this.connections.delete(ws);
  }

  updateState(newState: any) {
    this.state = { ...this.state, ...newState };
  }

  broadcast(message: any, sender?: WebSocket) {
    this.connections.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ ...message, roomId: this.id }));
      }
    });
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
}