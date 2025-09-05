// Shared types for CDK constructs

export interface EnvironmentConfig {
  readonly stage: 'dev' | 'staging' | 'prod';
  readonly region: string;
  readonly account: string;
}

export interface ResourceNames {
  readonly imagesBucket: string;
  readonly roomsTable: string;
  readonly gamesTable: string;
  readonly restApi: string;
  readonly webSocketApi: string;
  readonly amplifyApp: string;
}

export interface LambdaConfig {
  readonly timeout: number;
  readonly memorySize: number;
  readonly runtime: string;
}

export const DEFAULT_LAMBDA_CONFIG: LambdaConfig = {
  timeout: 300, // 5 minutes
  memorySize: 1024,
  runtime: 'nodejs18.x',
};

export const RESOURCE_NAMES: ResourceNames = {
  imagesBucket: 'DrawTogether-Images',
  roomsTable: 'DrawTogether-Rooms',
  gamesTable: 'DrawTogether-Games',
  restApi: 'DrawTogether-API',
  webSocketApi: 'DrawTogether-WebSocket',
  amplifyApp: 'DrawTogether',
};
