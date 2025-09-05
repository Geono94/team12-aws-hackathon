import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class DrawTogetherStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for images
    const imagesBucket = new s3.Bucket(this, 'ImagesBucket', {
      bucketName: `drawtogether-images-${this.account}`,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // DynamoDB Tables
    const gamesTable = new dynamodb.Table(this, 'GamesTable', {
      tableName: 'DrawTogether-Games',
      partitionKey: { name: 'gameId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const connectionsTable = new dynamodb.Table(this, 'ConnectionsTable', {
      tableName: 'DrawTogether-Connections',
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Functions
    const connectHandler = new lambda.Function(this, 'ConnectHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'connect.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        CONNECTIONS_TABLE: connectionsTable.tableName,
        GAMES_TABLE: gamesTable.tableName,
        AWS_REGION: 'us-east-1',
      },
    });

    const disconnectHandler = new lambda.Function(this, 'DisconnectHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'disconnect.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        CONNECTIONS_TABLE: connectionsTable.tableName,
        GAMES_TABLE: gamesTable.tableName,
      },
    });

    const messageHandler = new lambda.Function(this, 'MessageHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'message.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        CONNECTIONS_TABLE: connectionsTable.tableName,
        GAMES_TABLE: gamesTable.tableName,
        IMAGES_BUCKET: imagesBucket.bucketName,
        AWS_REGION: 'us-east-1',
      },
    });

    const aiHandler = new lambda.Function(this, 'AIHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'ai.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.minutes(5),
      environment: {
        IMAGES_BUCKET: imagesBucket.bucketName,
        GAMES_TABLE: gamesTable.tableName,
      },
    });

    // Grant permissions
    connectionsTable.grantReadWriteData(connectHandler);
    connectionsTable.grantReadWriteData(disconnectHandler);
    connectionsTable.grantReadWriteData(messageHandler);
    
    gamesTable.grantReadWriteData(connectHandler);
    gamesTable.grantReadWriteData(disconnectHandler);
    gamesTable.grantReadWriteData(messageHandler);
    gamesTable.grantReadWriteData(aiHandler);
    
    imagesBucket.grantReadWrite(messageHandler);
    imagesBucket.grantReadWrite(aiHandler);

    // Bedrock permissions
    aiHandler.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: ['*'],
    }));

    // WebSocket API
    const webSocketApi = new apigateway.WebSocketApi(this, 'WebSocketApi', {
      apiName: 'DrawTogether-WebSocket',
      connectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('ConnectIntegration', connectHandler),
      },
      disconnectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('DisconnectIntegration', disconnectHandler),
      },
      defaultRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('MessageIntegration', messageHandler),
      },
    });

    const webSocketStage = new apigateway.WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    // Grant API Gateway permissions to Lambda
    webSocketApi.grantManageConnections(messageHandler);

    // REST API for AI processing
    const restApi = new apigateway.HttpApi(this, 'RestApi', {
      apiName: 'DrawTogether-REST',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigateway.CorsHttpMethod.ANY],
        allowHeaders: ['*'],
      },
    });

    restApi.addRoutes({
      path: '/ai/generate',
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('AIIntegration', aiHandler),
    });

    // Static website bucket
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `drawtogether-website-${this.account}`,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'WebSocketURL', {
      value: webSocketStage.url,
      description: 'WebSocket API URL',
    });

    new cdk.CfnOutput(this, 'RestApiURL', {
      value: restApi.url!,
      description: 'REST API URL',
    });

    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: imagesBucket.bucketName,
      description: 'S3 Images Bucket Name',
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.domainName}`,
      description: 'CloudFront Website URL',
    });
  }
}
