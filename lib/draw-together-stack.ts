import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
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

    // AI endpoint
    const aiResource = restApi.root.addResource('ai');
    const generateResource = aiResource.addResource('generate');
    generateResource.addMethod('POST', new apigateway.LambdaIntegration(aiHandler));

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
