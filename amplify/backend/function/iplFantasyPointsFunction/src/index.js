const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
const path = require('path');

// S3 bucket details - should match the one in app.js
const BUCKET_NAME = 'ipl-fantasy-data-2025';

// Initialize function to ensure bucket exists
const initializeS3Bucket = async () => {
  try {
    // Check if bucket exists
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
    console.log(`S3 bucket ${BUCKET_NAME} already exists`);
  } catch (error) {
    if (error.statusCode === 404) {
      // Bucket doesn't exist, create it
      try {
        await s3.createBucket({
          Bucket: BUCKET_NAME,
          CreateBucketConfiguration: {
            LocationConstraint: 'eu-west-1' // Match your region
          }
        }).promise();
        console.log(`Created S3 bucket: ${BUCKET_NAME}`);

        // Set up CORS configuration
        await s3.putBucketCors({
          Bucket: BUCKET_NAME,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                AllowedOrigins: ['*'],
                ExposeHeaders: ['ETag']
              }
            ]
          }
        }).promise();
        console.log(`Set up CORS for bucket: ${BUCKET_NAME}`);

        // Set up public read access
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
        console.log(`Set up public read policy for bucket: ${BUCKET_NAME}`);
        
        // Upload initial files
        await createInitialFiles();
      } catch (createError) {
        console.error(`Error creating S3 bucket: ${createError.message}`);
      }
    } else {
      console.error(`Error checking S3 bucket: ${error.message}`);
    }
  }
};

// Create and upload initial files to the S3 bucket
const createInitialFiles = async () => {
  try {
    // Create initial schedule.json
    const scheduleData = {
      matches: [
        {
          id: "match1",
          team1: "Kolkata Knight Riders",
          team2: "Royal Challengers Bengaluru",
          date: "22-Mar-25",
          venue: "Kolkata"
        },
        {
          id: "match2",
          team1: "Mumbai Indians",
          team2: "Chennai Super Kings",
          date: "23-Mar-25",
          venue: "Mumbai"
        },
        {
          id: "match3",
          team1: "Punjab Kings",
          team2: "Gujarat Titans",
          date: "24-Mar-25",
          venue: "Mohali"
        }
      ]
    };
    
    // Create initial standings.json
    const standingsData = {
      teams: [
        { teamName: "Team 1", points: 0 },
        { teamName: "Team 2", points: 0 },
        { teamName: "Team 3", points: 0 }
      ]
    };
    
    // Upload schedule.json
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: "schedule.json",
      Body: JSON.stringify(scheduleData, null, 2),
      ContentType: "application/json"
    }).promise();
    console.log("Created initial schedule.json");
    
    // Upload standings.json
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: "standings.json",
      Body: JSON.stringify(standingsData, null, 2),
      ContentType: "application/json"
    }).promise();
    console.log("Created initial standings.json");
    
    // Create empty matches directory structure
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: "matches/",
      Body: ""
    }).promise();
    console.log("Created matches directory");
    
  } catch (error) {
    console.error("Error creating initial files:", error.message);
  }
};

// Initialize on cold start
initializeS3Bucket().catch(err => console.error('Initialization error:', err));

/**
 * @type {import('http').Server}
 */
const server = awsServerlessExpress.createServer(app);

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
