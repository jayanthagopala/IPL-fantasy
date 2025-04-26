#!/bin/bash
# IPL Fantasy Standings Lambda Deployment Script
# This script deploys the update-standings-lambda.js as an AWS Lambda function

set -e  # Exit on error

# Configuration - Edit these values
FUNCTION_NAME="ipl-fantasy-standings-updater"
REGION=${AWS_REGION:-"eu-west-1"}
S3_BUCKET=${S3_BUCKET_NAME:-"ipl-fantasy-data-2025"}
ROLE_NAME="ipl-fantasy-lambda-role"
ROLE_ARN=""

echo "🚀 Deploying IPL Fantasy Standings Updater Lambda"
echo "=================================================="

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI is not installed. Please install it first."
  exit 1
fi

# Check AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ AWS credentials not configured. Run 'aws configure' first."
  exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment
npm init -y > /dev/null
npm install @aws-sdk/client-s3 --save > /dev/null
cp update-standings-lambda.js deployment/index.js
cd deployment
zip -r function.zip index.js node_modules > /dev/null
cd ..

# Check if S3 bucket exists and create if not
echo "🪣 Checking S3 bucket..."
if ! aws s3api head-bucket --bucket "$S3_BUCKET" --region "$REGION" 2>/dev/null; then
  echo "Creating S3 bucket: $S3_BUCKET"
  aws s3api create-bucket --bucket "$S3_BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" \
    || { echo "❌ Failed to create S3 bucket"; exit 1; }
  
  # Enable default encryption for the bucket
  aws s3api put-bucket-encryption \
    --bucket "$S3_BUCKET" \
    --server-side-encryption-configuration '{
      "Rules": [
        {
          "ApplyServerSideEncryptionByDefault": {
            "SSEAlgorithm": "AES256"
          },
          "BucketKeyEnabled": true
        }
      ]
    }' \
    --region "$REGION" \
    || echo "⚠️  Warning: Could not enable default encryption for bucket"
fi

# Create IAM role for Lambda if it doesn't exist
echo "👤 Setting up IAM role..."
if ! aws iam get-role --role-name "$ROLE_NAME" &> /dev/null; then
  echo "Creating IAM role for Lambda..."
  
  # Create trust policy file
  cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # Create permission policy file
  cat > permission-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::${S3_BUCKET}/*",
        "arn:aws:s3:::${S3_BUCKET}"
      ]
    }
  ]
}
EOF

  # Create the role and attach policy
  ROLE_RESPONSE=$(aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document file://trust-policy.json)
  
  ROLE_ARN=$(echo "$ROLE_RESPONSE" | grep -o '"Arn": "[^"]*' | cut -d'"' -f4)
  
  aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "${ROLE_NAME}-policy" \
    --policy-document file://permission-policy.json
  
  # Wait for role to propagate
  echo "⏳ Waiting for IAM role to propagate..."
  sleep 10
else
  # Get role ARN if it already exists
  ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
fi

echo "🔑 Using role ARN: $ROLE_ARN"

# Check if Lambda function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
  # Update existing function
  echo "🔄 Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://deployment/function.zip \
    --region "$REGION" \
    --publish \
    || { echo "❌ Failed to update Lambda function"; exit 1; }
else
  # Create new function
  echo "🆕 Creating new Lambda function..."
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime nodejs18.x \
    --handler index.handler \
    --role "$ROLE_ARN" \
    --zip-file fileb://deployment/function.zip \
    --region "$REGION" \
    --timeout 30 \
    --memory-size 128 \
    --environment "Variables={S3_BUCKET=$S3_BUCKET,STANDINGS_FILE=game-standings.json}" \
    || { echo "❌ Failed to create Lambda function"; exit 1; }
fi

# Clean up
echo "🧹 Cleaning up deployment files..."
rm -rf deployment
rm -f trust-policy.json permission-policy.json

echo ""
echo "✅ Deployment completed successfully!"
echo "Lambda function name: $FUNCTION_NAME"
echo "S3 bucket name: $S3_BUCKET"
echo ""
echo "To invoke the function, use:"
echo "aws lambda invoke --function-name $FUNCTION_NAME --region $REGION --payload file://sample-data.json output.txt"
echo ""
echo "Create a sample-data.json file with content like:"
echo '{
  "matchNo": 1,
  "leaderboard": [
    {"username": "player1", "points": 100, "rank": 1},
    {"username": "player2", "points": 90, "rank": 2}
  ]
}' 