#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DrawTogetherStack } from './lib/draw-together-stack';

const app = new cdk.App();
new DrawTogetherStack(app, 'DrawTogetherStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'us-east-1',
  },
});
