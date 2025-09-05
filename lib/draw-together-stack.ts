import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class DrawTogetherStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for images
    const imagesBucket = new s3.Bucket(this, 'ImagesBucket', {
      bucketName: `drawtogether-images-${this.account}-${Date.now()}`,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // DynamoDB Tables
    const roomsTable = new dynamodb.Table(this, 'RoomsTable', {
      tableName: 'DrawTogether-Rooms',
      partitionKey: { name: 'roomId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // GSI for finding available rooms quickly
    roomsTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'playerCount', type: dynamodb.AttributeType.NUMBER },
    });

    const gamesTable = new dynamodb.Table(this, 'GamesTable', {
      tableName: 'DrawTogether-Games',
      partitionKey: { name: 'gameId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Room Handler Lambda
    const roomHandler = new lambda.Function(this, 'RoomHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'room-handler.handler',
      code: lambda.Code.fromAsset('lambda/dist'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        ROOMS_TABLE: roomsTable.tableName,
      },
    });

    // AI Handler Lambda
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
    roomsTable.grantReadWriteData(roomHandler);
    gamesTable.grantReadWriteData(aiHandler);
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

    // REST API
    const restApi = new apigateway.RestApi(this, 'RestApi', {
      restApiName: 'DrawTogether-API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    // Room endpoints
    const roomsResource = restApi.root.addResource('rooms');
    const createResource = roomsResource.addResource('create');
    const leaveResource = roomsResource.addResource('leave');
    const roomIdResource = roomsResource.addResource('{roomId}');
    const statusResource = roomIdResource.addResource('status');
    
    createResource.addMethod('POST', new apigateway.LambdaIntegration(roomHandler));
    leaveResource.addMethod('POST', new apigateway.LambdaIntegration(roomHandler));
    roomIdResource.addMethod('GET', new apigateway.LambdaIntegration(roomHandler));
    statusResource.addMethod('PUT', new apigateway.LambdaIntegration(roomHandler));

    // AI endpoint
    const aiResource = restApi.root.addResource('ai');
    const generateResource = aiResource.addResource('generate');
    generateResource.addMethod('POST', new apigateway.LambdaIntegration(aiHandler));

    // S3 Trigger Handler
    const s3TriggerHandler = new lambda.Function(this, 'S3TriggerHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 's3-trigger.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        ROOMS_TABLE_NAME: roomsTable.tableName,
        AI_HANDLER_NAME: aiHandler.functionName,
      },
    });

    roomsTable.grantReadData(s3TriggerHandler);
    aiHandler.grantInvoke(s3TriggerHandler);

    // S3 event notification
    imagesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(s3TriggerHandler),
      { prefix: 'original/' }
    );

    // GitHub token secret
    // const githubToken = secretsmanager.Secret.fromSecretNameV2(
    //   this,
    //   'GitHubToken',
    //   'github-token'
    // );

    // Amplify App
    // const amplifyApp = new amplify.App(this, 'DrawTogetherApp', {
    //   sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
    //     owner: process.env.GITHUB_OWNER || 'default-owner',
    //     repository: process.env.GITHUB_REPO || 'team12-aws-hackathon',
    //     oauthToken: githubToken.secretValue,
    //   }),
    //   environmentVariables: {
    //     REACT_APP_API_URL: restApi.url,
    //     REACT_APP_S3_BUCKET: imagesBucket.bucketName,
    //   },
    // });

    // amplifyApp.addBranch('main');
    // amplifyApp.addBranch('preview');

    // Outputs
    new cdk.CfnOutput(this, 'RestApiURL', {
      value: restApi.url,
      description: 'REST API URL',
    });

    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: imagesBucket.bucketName,
      description: 'S3 Images Bucket Name',
    });
  }
}
