import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { RESOURCE_NAMES } from './types';

export class DrawTogetherStack extends cdk.Stack {
  public readonly restApiUrl: string;
  public readonly bucketName: string;
  public readonly ecrRepositoryUri: string;
  public readonly vpc: ec2.Vpc;
  public readonly ecsCluster: ecs.Cluster;
  public readonly loadBalancer: elbv2.NetworkLoadBalancer;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'DrawTogetherVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // ECR Repository
    const ecrRepository = new ecr.Repository(this, 'DrawTogetherRepository', {
      repositoryName: RESOURCE_NAMES.ecrRepository,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'DrawTogetherCluster', {
      vpc: vpc,
      clusterName: 'DrawTogether-Cluster',
    });

    // Security Groups

    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'ECSSecurityGroup', {
      vpc: vpc,
      description: 'Security group for ECS tasks',
      allowAllOutbound: true,
    });

    // Allow direct internet access for Network Load Balancer
    ecsSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      'Allow internet access to port 3000'
    );

    ecsSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3001),
      'Allow internet access to port 3001'
    );

    // CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'DrawTogetherLogGroup', {
      logGroupName: '/ecs/drawtogether',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DrawTogetherTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    // Container Definition
    const container = taskDefinition.addContainer('DrawTogetherContainer', {
      image: ecs.ContainerImage.fromEcrRepository(ecrRepository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'drawtogether',
        logGroup: logGroup,
      }),
      portMappings: [
        {
          containerPort: 3000,
          protocol: ecs.Protocol.TCP,
        },
        {
          containerPort: 3001,
          protocol: ecs.Protocol.TCP,
        }
      ],
    });

    // Network Load Balancer
    const nlb = new elbv2.NetworkLoadBalancer(this, 'DrawTogetherNLB', {
      vpc: vpc,
      internetFacing: true,
      loadBalancerName: 'DrawTogether-NLB',
    });

    // Target Groups
    const targetGroup3000 = new elbv2.NetworkTargetGroup(this, 'DrawTogetherTargetGroup3000', {
      vpc: vpc,
      port: 3000,
      protocol: elbv2.Protocol.TCP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        protocol: elbv2.Protocol.HTTP,
        port: '3000',
        path: '/',
        interval: cdk.Duration.seconds(5),
        timeout: cdk.Duration.seconds(2),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        healthyHttpCodes: '200',
      },
    });

    const targetGroup3001 = new elbv2.NetworkTargetGroup(this, 'DrawTogetherTargetGroup3001', {
      vpc: vpc,
      port: 3001,
      protocol: elbv2.Protocol.TCP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        protocol: elbv2.Protocol.TCP,
        port: '3001',
        interval: cdk.Duration.seconds(5),
        timeout: cdk.Duration.seconds(2),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
      },
    });

    // Listeners
    nlb.addListener('DrawTogetherListener3000', {
      port: 3000,
      protocol: elbv2.Protocol.TCP,
      defaultTargetGroups: [targetGroup3000],
    });

    nlb.addListener('DrawTogetherListener3001', {
      port: 3001,
      protocol: elbv2.Protocol.TCP,
      defaultTargetGroups: [targetGroup3001],
    });

    // ECS Service
    const service = new ecs.FargateService(this, 'DrawTogetherService', {
      cluster: cluster,
      taskDefinition: taskDefinition,
      desiredCount: 1,
      assignPublicIp: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [ecsSecurityGroup],
    });

    // Attach service to target groups with specific container ports
    targetGroup3000.addTarget(service.loadBalancerTarget({
      containerName: 'DrawTogetherContainer',
      containerPort: 3000,
    }));

    targetGroup3001.addTarget(service.loadBalancerTarget({
      containerName: 'DrawTogetherContainer', 
      containerPort: 3001,
    }));

    // S3 Bucket for images
    const imagesBucket = new s3.Bucket(this, 'ImagesBucket', {
      bucketName: `drawtogether-images-${this.account}`,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Grant S3 permissions to ECS task
    imagesBucket.grantReadWrite(taskDefinition.taskRole);

    // DynamoDB Tables
    const roomsTable = new dynamodb.Table(this, 'RoomsTable', {
      tableName: RESOURCE_NAMES.roomsTable,
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

    // Room Handler Lambda
    const roomHandler = new lambda.Function(this, 'RoomHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/room-handler.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        ROOMS_TABLE: roomsTable.tableName,
      },
    });

    // AI Handler Lambda
    const aiHandler = new lambda.Function(this, 'AIHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/ai-handler.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.minutes(5),
    });

    // Grant permissions
    roomsTable.grantReadWriteData(roomHandler);
    roomsTable.grantReadWriteData(aiHandler);
    imagesBucket.grantReadWrite(aiHandler);

    // Additional S3 permissions for test buckets
    aiHandler.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject'
      ],
      resources: ['arn:aws:s3:::drawtogether-*/*'],
    }));

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
      restApiName: RESOURCE_NAMES.restApi,
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
    const finishedResource = roomsResource.addResource('finished');
    const roomIdResource = roomsResource.addResource('{roomId}');
    const statusResource = roomIdResource.addResource('status');
    
    createResource.addMethod('POST', new apigateway.LambdaIntegration(roomHandler));
    leaveResource.addMethod('POST', new apigateway.LambdaIntegration(roomHandler));
    finishedResource.addMethod('GET', new apigateway.LambdaIntegration(roomHandler));
    roomIdResource.addMethod('GET', new apigateway.LambdaIntegration(roomHandler));
    statusResource.addMethod('PUT', new apigateway.LambdaIntegration(roomHandler));

    // AI endpoint
    const aiResource = restApi.root.addResource('ai');
    const generateResource = aiResource.addResource('generate');
    generateResource.addMethod('POST', new apigateway.LambdaIntegration(aiHandler));

    // S3 Trigger Handler
    const s3TriggerHandler = new lambda.Function(this, 'S3TriggerHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/s3-trigger.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        ROOMS_TABLE_NAME: roomsTable.tableName,
        AI_HANDLER_NAME: aiHandler.functionName,
      },
    });

    roomsTable.grantReadData(s3TriggerHandler);
    aiHandler.grantInvoke(s3TriggerHandler);

    // S3 event notification
    const targetBucket = s3.Bucket.fromBucketName(this, 'TargetBucket', 'drawtogether-test-1757052413482');
    targetBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(s3TriggerHandler)
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

    // Outputs
    new cdk.CfnOutput(this, 'RestApiURL', {
      value: restApi.url,
      description: 'REST API URL',
    });

    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: imagesBucket.bucketName,
      description: 'S3 Images Bucket Name',
    });

    new cdk.CfnOutput(this, 'ECRRepositoryURI', {
      value: ecrRepository.repositoryUri,
      description: 'ECR Repository URI',
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID',
    });

    new cdk.CfnOutput(this, 'ECSClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster Name',
    });

    new cdk.CfnOutput(this, 'LoadBalancerURL', {
      value: nlb.loadBalancerDnsName,
      description: 'Network Load Balancer DNS Name',
    });

    new cdk.CfnOutput(this, 'AppURL3000', {
      value: `http://${nlb.loadBalancerDnsName}:3000`,
      description: 'Application URL (Port 3000)',
    });

    new cdk.CfnOutput(this, 'WebSocketURL3001', {
      value: `ws://${nlb.loadBalancerDnsName}:3001`,
      description: 'WebSocket URL (Port 3001)',
    });

    // Export values for Amplify stack
    this.restApiUrl = restApi.url;
    this.bucketName = imagesBucket.bucketName;
    this.ecrRepositoryUri = ecrRepository.repositoryUri;
    this.vpc = vpc;
    this.ecsCluster = cluster;
    this.loadBalancer = nlb;
  }
}
