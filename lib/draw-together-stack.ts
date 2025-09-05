import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
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

    // Next.js Lambda Function
    const nextjsHandler = new lambda.Function(this, 'NextjsHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'server.handler',
      code: lambda.Code.fromAsset('frontend/.next/standalone'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      environment: {
        GAMES_TABLE: gamesTable.tableName,
        IMAGES_BUCKET: imagesBucket.bucketName,
        AWS_REGION: 'us-east-1',
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
    gamesTable.grantReadWriteData(nextjsHandler);
    gamesTable.grantReadWriteData(aiHandler);
    
    imagesBucket.grantReadWrite(nextjsHandler);
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

    // HTTP API
    const httpApi = new apigateway.HttpApi(this, 'HttpApi', {
      apiName: 'DrawTogether-API',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigateway.CorsHttpMethod.ANY],
        allowHeaders: ['*'],
      },
    });

    // Next.js routes
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigateway.HttpMethod.ANY],
      integration: new integrations.HttpLambdaIntegration('NextjsIntegration', nextjsHandler),
    });

    // AI endpoint
    httpApi.addRoutes({
      path: '/api/ai/generate',
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('AIIntegration', aiHandler),
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiURL', {
      value: httpApi.url!,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: imagesBucket.bucketName,
      description: 'S3 Images Bucket Name',
    });
  }
}
