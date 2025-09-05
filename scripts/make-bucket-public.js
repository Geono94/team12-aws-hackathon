const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();
const BUCKET_NAME = 'drawtogether-test-1757052413482';

async function makeBucketPublic() {
  try {
    // Remove public access block
    await s3.deletePublicAccessBlock({
      Bucket: BUCKET_NAME
    }).promise();
    
    console.log('✓ Removed public access block');

    // Set bucket policy for public read
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
        }
      ]
    };

    await s3.putBucketPolicy({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    }).promise();
    
    console.log('✓ Set public read policy');
    console.log(`\n🎉 Bucket ${BUCKET_NAME} is now publicly accessible!`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

makeBucketPublic();
