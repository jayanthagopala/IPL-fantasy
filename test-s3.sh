#!/bin/bash

echo "Starting IPL Fantasy App with S3 Integration Test"
echo "================================================"
echo "Files in public/s3-data directory:"
ls -la public/s3-data/

echo ""
echo "Running npm start to launch the application..."
echo "Please test the S3 integration in your browser."
echo "The app should load data from the simulated S3 bucket in public/s3-data/"
echo ""
echo "To test in production with a real S3 bucket:"
echo "1. Edit src/services/S3Service.js"
echo "2. Set USE_LOCAL_FILES = false"
echo "3. Update REGION and BUCKET_NAME if needed"
echo "4. Deploy to AWS Amplify"
echo ""

npm start 