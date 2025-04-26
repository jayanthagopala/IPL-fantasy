#!/bin/bash
# Script to set up S3 bucket and deploy initial empty data files

# Configuration
BUCKET_NAME="ipl-fantasy-data-2025"
REGION="eu-west-1"
EMPTY_STANDINGS_FILE="empty-standings.json"
IPL_SCHEDULE_FILE="public/s3-data/ipl-schedule-json.json"

echo "Setting up S3 bucket for IPL Fantasy League"
echo "=========================================="
echo "Bucket name: $BUCKET_NAME"
echo "Region: $REGION"
echo 

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    echo "You can install it via: pip install awscli"
    exit 1
fi

# Check if AWS is configured
if ! aws configure list &> /dev/null; then
    echo "AWS CLI is not configured. Please run 'aws configure' first."
    echo "You need to provide your AWS Access Key ID, Secret Access Key, and default region."
    exit 1
fi

echo "Creating S3 bucket if it doesn't exist..."
if ! aws s3api head-bucket --bucket $BUCKET_NAME 2>/dev/null; then
    aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION --create-bucket-configuration LocationConstraint=$REGION
    echo "Bucket $BUCKET_NAME created."
else
    echo "Bucket $BUCKET_NAME already exists."
fi

# Set up CORS configuration for the bucket
echo "Setting up CORS configuration..."
cat > /tmp/cors-config.json << EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file:///tmp/cors-config.json
echo "CORS configuration applied."

# Set up bucket policy for public read access
echo "Setting up bucket policy for public read access..."
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json
echo "Bucket policy applied."

# Upload files to S3
echo "Uploading empty standings JSON file..."
if [ -f "$EMPTY_STANDINGS_FILE" ]; then
    aws s3 cp $EMPTY_STANDINGS_FILE s3://$BUCKET_NAME/empty-standings.json --content-type "application/json"
    echo "Empty standings file uploaded successfully."
else
    echo "Error: $EMPTY_STANDINGS_FILE not found."
    exit 1
fi

echo "Uploading IPL schedule JSON file..."
if [ -f "$IPL_SCHEDULE_FILE" ]; then
    aws s3 cp $IPL_SCHEDULE_FILE s3://$BUCKET_NAME/ipl-schedule-json.json --content-type "application/json"
    echo "IPL schedule file uploaded successfully."
else
    echo "Error: $IPL_SCHEDULE_FILE not found."
    exit 1
fi

# Test access
echo "Testing S3 access..."
EMPTY_STANDINGS_URL="https://$BUCKET_NAME.s3.$REGION.amazonaws.com/empty-standings.json"
IPL_SCHEDULE_URL="https://$BUCKET_NAME.s3.$REGION.amazonaws.com/ipl-schedule-json.json"

if curl -s --head "$EMPTY_STANDINGS_URL" | grep "200 OK" > /dev/null; then
    echo "Empty standings file is accessible at: $EMPTY_STANDINGS_URL"
else
    echo "Warning: Unable to access empty standings file. Please check bucket permissions."
fi

if curl -s --head "$IPL_SCHEDULE_URL" | grep "200 OK" > /dev/null; then
    echo "IPL schedule file is accessible at: $IPL_SCHEDULE_URL"
else
    echo "Warning: Unable to access IPL schedule file. Please check bucket permissions."
fi

# Updating S3Service.js file
echo -e "\n\nIMPORTANT: Don't forget to update your S3Service.js file with the following changes:"
echo "1. Set USE_LOCAL_FILES to false for production"
echo "2. Update REGION to $REGION if needed"
echo "3. Update BUCKET_NAME to $BUCKET_NAME if needed"
echo -e "\nFile location: src/services/S3Service.js\n"

# Clean up temporary files
rm -f /tmp/cors-config.json /tmp/bucket-policy.json

echo "Setup complete!" 