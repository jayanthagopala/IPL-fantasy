# IPL Fantasy League 2025

A React-based web application for managing an IPL (Indian Premier League) fantasy league competition among friends. The application allows tracking scores, managing match points, and viewing standings for the 2025 IPL season.

## Features

### Match Points Management
- **Admin Panel**: Secure admin interface for entering match scores
- **Automated Scoring System**: 
  - Raw scores are entered for each player
  - Players are automatically ranked based on their performance
  - Points are assigned according to ranks:
    1. 1st Place: +50 points
    2. 2nd Place: +20 points
    3. 3rd Place: +5 points
    4. 4th Place: 0 points
    5. 5th Place: -5 points
    6. 6th Place: -10 points
    7. 7th Place: -15 points
    8. 8th Place: -20 points
    9. 9th Place: -25 points

### Data Storage
- Points data is stored in AWS DynamoDB
- Secure authentication for admin access
- Real-time calculation and display of points

### Match Schedule
- Complete IPL 2025 schedule
- 70 league matches
- 4 playoff matches (Qualifier 1, Eliminator, Qualifier 2, and Final)

### Participants
- Tracks scores for 9 players:
  - Jaya
  - Justin
  - Ram
  - Sibi
  - Sundar
  - Sampath
  - Jayanth
  - Vicky
  - Anantha

## Technical Stack

- **Frontend**: React.js
- **Database**: Amazon DynamoDB
- **Styling**: Custom CSS with modern UI/UX
- **AWS SDK**: For DynamoDB integration

## Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/ipl-fantasy-2025.git
```

2. Install dependencies
```bash
cd ipl-fantasy-2025
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory: 
```

## S3 Integration Testing

This application can fetch data from Amazon S3. For development, we've included a local test mode that simulates S3 using files in the `/public/s3-data/` directory.

### To test S3 integration locally:

1. Make sure the required JSON files are in the `/public/s3-data/` directory:
   - `ipl-schedule-json.json` - Match schedule
   - `game-standings.json` - Fantasy standings for each match

2. Run the test script:
   ```bash
   ./test-s3.sh
   ```

### To use real S3 in production:

1. Create and configure your S3 bucket following the instructions in `S3-SETUP.md`

2. Edit `src/services/S3Service.js`:
   - Set `USE_LOCAL_FILES = false`
   - Update `REGION` and `BUCKET_NAME` if needed

3. Deploy to AWS Amplify

## Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Deployment to AWS Amplify

This application is configured for easy deployment to AWS Amplify.

1. Set up your AWS Amplify environment
2. Configure S3 bucket as described in `S3-SETUP.md`
3. Run:
   ```bash
   amplify publish
   ```

## Updating Match Data

After each match, update the standings data by:

1. Editing the `game-standings.json` file
2. If using S3, upload the updated file to your S3 bucket:
   ```bash
   aws s3 cp game-standings.json s3://your-bucket-name/game-standings.json --content-type application/json
   ```

# IPL Fantasy Standings Lambda Updater

This project contains an AWS Lambda function that securely updates IPL fantasy standings data stored in an S3 bucket.

## Prerequisites

- AWS CLI installed and configured
- Node.js 14+ installed
- Basic knowledge of AWS Lambda, S3, and API Gateway

## Files Overview

- `update-standings-lambda.js` - The Lambda function code
- `deploy-lambda.sh` - Deployment script to set up the Lambda function on AWS

## Setup Instructions

1. Make sure you have AWS CLI installed and configured with appropriate credentials:
   ```
   aws configure
   ```

2. Make the deployment script executable:
   ```
   chmod +x deploy-lambda.sh
   ```

3. Run the deployment script:
   ```
   ./deploy-lambda.sh
   ```
   
   This script will:
   - Create an IAM role with appropriate permissions
   - Install necessary dependencies
   - Package the Lambda function code
   - Deploy the function to AWS Lambda
   - Optionally set up an API Gateway endpoint

4. When prompted, choose whether you want to set up an API Gateway trigger for the Lambda function.

## Usage

### Option 1: Using the Lambda function directly via AWS Console

1. Navigate to the Lambda function in the AWS Console
2. Create a test event with the following format:
   ```json
   {
     "matchNo": 42,
     "leaderboard": [
       {
         "username": "player1",
         "points": 120,
         "rank": 1
       },
       {
         "username": "player2",
         "points": 115,
         "rank": 2
       },
       ...
     ]
   }
   ```
3. Run the test to update the standings.

### Option 2: Using API Gateway (if configured)

If you set up an API Gateway endpoint during deployment, you can update standings by making a POST request to the provided endpoint:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "matchNo": 42,
    "leaderboard": [
      {
        "username": "player1",
        "points": 120,
        "rank": 1
      },
      {
        "username": "player2",
        "points": 115,
        "rank": 2
      }
    ]
  }' \
  https://YOUR-API-GATEWAY-URL/prod/update-standings
```

Replace `YOUR-API-GATEWAY-URL` with the URL provided after deployment.

### Option 3: Using AWS SDK in your application

You can also invoke the Lambda function directly from your application using the AWS SDK:

```javascript
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const client = new LambdaClient({ region: "eu-west-1" });

const params = {
  FunctionName: "ipl-fantasy-standings-updater",
  Payload: JSON.stringify({
    matchNo: 42,
    leaderboard: [
      {
        username: "player1",
        points: 120,
        rank: 1
      },
      {
        username: "player2",
        points: 115,
        rank: 2
      }
    ]
  })
};

const command = new InvokeCommand(params);
const response = await client.send(command);
```

## Data Format

The Lambda function expects input in the following format:

```json
{
  "matchNo": 42, // Match number
  "leaderboard": [
    {
      "username": "player1", // Player username
      "points": 120,         // Player's total points
      "rank": 1              // Player's rank
    },
    ...
  ]
}
```

The function will store standings data in the S3 bucket specified in the Lambda environment variables:
- Bucket: `ipl-fantasy-data-2025`
- File: `game-standings.json`

## Security Considerations

- The Lambda function assumes the IAM role to access S3
- API Gateway can be protected with additional authentication methods
- Consider adding API keys or OAuth authentication for production use

## Troubleshooting

- Check CloudWatch Logs for detailed error messages
- Verify the Lambda function has appropriate S3 permissions
- Ensure the input JSON matches the expected format

## S3 Integration for Game Standings

When the application is deployed to AWS Amplify, all game standings data is saved to and retrieved from an S3 bucket. Here's how it works:

### Data Flow

1. Users submit game standings data through the LeaderboardSubmission component
2. In production (`USE_LOCAL_FILES = false` in S3Service.js), the data is saved directly to the S3 bucket
3. All components that display standings data (Standings, Schedule) fetch the data from S3 using the `fetchJsonFromS3` function

### Configuration

- The S3 bucket name is configured in `src/services/S3Service.js` (default: 'ipl-fantasy-data-2025')
- The AWS region is also configured in the same file (default: 'eu-west-1')
- Before deploying to production, ensure:
  - The S3 bucket exists and is properly configured
  - `USE_LOCAL_FILES` is set to `false` in S3Service.js
  - The application has proper permissions to read/write to S3

### Testing Locally

For local development and testing:
- Set `USE_LOCAL_FILES = true` in S3Service.js
- The app will use the local JSON files in the `/public/s3-data/` directory
- Changes will be simulated by saving to localStorage

### Permissions

The application requires the following permissions to interact with S3:
- `s3:GetObject` - To read standings data
- `s3:PutObject` - To save new standings data

These permissions are configured in the application's IAM role when deployed to Amplify.