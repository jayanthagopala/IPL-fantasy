# S3 Integration Setup

This document outlines how to set up the S3 bucket for storing and accessing the JSON data files for the IPL Fantasy application when deployed to AWS Amplify.

## Prerequisites

1. An AWS account with appropriate permissions
2. AWS CLI installed and configured on your development machine
3. The application deployed to AWS Amplify

## S3 Bucket Setup

1. Create an S3 bucket to store your JSON data files:

```bash
aws s3 mb s3://ipl-fantasy-data-2025 --region eu-west-1
```

2. Configure CORS for the bucket to allow access from your Amplify app domain:

```bash
# Create a cors.json file with the following content
cat > cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": [],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

# Apply CORS configuration to the bucket
aws s3api put-bucket-cors --bucket ipl-fantasy-data-2025 --cors-configuration file://cors.json
```

3. Set appropriate bucket policy to allow public read access:

```bash
# Create a bucket-policy.json file
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ipl-fantasy-data-2025/*"
    }
  ]
}
EOF

# Apply the bucket policy
aws s3api put-bucket-policy --bucket ipl-fantasy-data-2025 --policy file://bucket-policy.json
```

## Uploading JSON Files to S3

1. Upload your JSON data files to the S3 bucket:

```bash
# Upload schedule data
aws s3 cp src/components/ipl-schedule-json.json s3://ipl-fantasy-data-2025/ipl-schedule-json.json --content-type application/json

# Upload standings data
aws s3 cp src/components/game-standings.json s3://ipl-fantasy-data-2025/game-standings.json --content-type application/json
```

## Updating JSON Files

To update the JSON files after matches:

1. Update your local JSON files
2. Upload the updated files to S3:

```bash
aws s3 cp src/components/game-standings.json s3://ipl-fantasy-data-2025/game-standings.json --content-type application/json
```

## Troubleshooting

If you encounter issues with accessing the S3 data:

1. Check the CORS configuration of your S3 bucket
2. Verify that the bucket policy allows public read access
3. Ensure the JSON files are accessible via their S3 URLs, e.g.:
   - `https://ipl-fantasy-data-2025.s3.eu-west-1.amazonaws.com/ipl-schedule-json.json`
   - `https://ipl-fantasy-data-2025.s3.eu-west-1.amazonaws.com/game-standings.json`
4. Check browser console for any CORS or network errors

## Security Considerations

The current setup allows public read access to the S3 bucket. For more sensitive data, consider:

1. Implementing authentication with Amazon Cognito
2. Using pre-signed URLs for temporary access
3. Setting up CloudFront with OAI (Origin Access Identity) for more secure access 