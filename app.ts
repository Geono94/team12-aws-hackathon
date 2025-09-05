#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DrawTogetherStack } from './lib/draw-together-stack';
import { AmplifyStack } from './lib/amplify-stack';

const app = new cdk.App();

const backendStack = new DrawTogetherStack(app, 'DrawTogetherStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});

new AmplifyStack(app, 'DrawTogetherAmplifyStack', {
  apiUrl: backendStack.restApiUrl,
  bucketName: backendStack.bucketName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});
