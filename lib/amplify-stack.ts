import * as cdk from 'aws-cdk-lib';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import { Construct } from 'constructs';

export interface AmplifyStackProps extends cdk.StackProps {
  apiUrl: string;
  bucketName: string;
}

export class AmplifyStack extends cdk.Stack {
  public readonly amplifyApp: amplify.App;

  constructor(scope: Construct, id: string, props: AmplifyStackProps) {
    super(scope, id, props);

    this.amplifyApp = new amplify.App(this, 'DrawTogetherApp', {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'Geono94',
        repository: 'team12-aws-hackathon',
        oauthToken: cdk.SecretValue.secretsManager('github-token'),
      }),
      environmentVariables: {
        NEXT_PUBLIC_API_URL: props.apiUrl,
        NEXT_PUBLIC_S3_BUCKET: props.bucketName,
      },
    });

    const mainBranch = this.amplifyApp.addBranch('main');

    new cdk.CfnOutput(this, 'AmplifyURL', {
      value: `https://${mainBranch.branchName}.${this.amplifyApp.defaultDomain}`,
    });
  }
}
