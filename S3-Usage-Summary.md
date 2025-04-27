# S3 Usage in IPL Fantasy Application

## Overview
The IPL Fantasy application uses AWS S3 to store and retrieve JSON data that is essential for the application's functionality. This includes match schedules, game standings/leaderboards, and other related data. The S3 integration is designed to be flexible, supporting both local development and production environments.

## Key Data Files

### 1. `game-standings.json`
- **Purpose**: Stores match results and fantasy points leaderboard for each match
- **Structure**:
  ```json
  {
    "standings": [
      {
        "matchNo": 1,
        "match_info": {
          "team_1": "Team Name",
          "team_2": "Team Name",
          "team_1_score": "Score",
          "team_2_score": "Score",
          "result": "Result text"
        },
        "teams": [
          { "teamName": "Fantasy Team Name", "points": 120, "rank": 1, "note": "Optional note" },
          // Additional teams
        ]
      }
      // Additional matches
    ],
    "defaultStanding": {
      "teams": [
        // Default standings data
      ]
    }
  }
  ```

### 2. `ipl-schedule-json.json`
- **Purpose**: Contains the full IPL tournament schedule
- **Structure**:
  ```json
  {
    "tournament": "IPL",
    "season": "2025",
    "totalMatches": 74,
    "matches": [
      {
        "matchNo": 1,
        "matchDay": 1,
        "date": "22-Mar-25",
        "day": "Sat",
        "time": "7:30 PM",
        "homeTeam": "Team Name",
        "awayTeam": "Team Name",
        "venue": "Venue Name"
      }
      // Additional matches
    ]
  }
  ```

## Core S3 Service Implementation

### `S3Service.js`
Located at `src/services/S3Service.js`, this service provides the core functionality for interacting with S3:

#### Configuration
- **Region**: `eu-west-1` (configurable)
- **Bucket Name**: `ipl-fantasy-data-2025` (configurable)
- **Environment Toggle**: `USE_LOCAL_FILES` flag controls whether to use local files (development) or S3 (production)

#### Key Functions
1. **`fetchJsonFromS3(key)`**
   - Fetches JSON data from either S3 or local files based on environment setting
   - In development: Reads from `/public/s3-data/` directory
   - In production: Makes direct requests to S3 bucket URLs
   - Includes error handling and logging

2. **`saveLeaderboardData(matchNo, data)`**
   - Updates the game standings with new match data
   - Retrieves existing standings, updates the specific match, and saves back to S3
   - In development: Saves to localStorage
   - In production: Uses AWS SDK to upload to S3

## S3 Admin Interface

The application includes an admin interface for managing S3 data:

### `LeaderboardSubmission.jsx`
- Provides a UI for updating match results and fantasy points
- Features:
  - Match selection dropdown
  - JSON data editor
  - Validation of input data
  - Preview of changes before submission
  - Error handling and success notifications

### Backend API for S3 Operations
Located in the `/src/api` directory:

1. **`s3Handler.js`**
   - Provides server-side handling of S3 operations
   - Implements functions for:
     - `getFileFromS3`: Fetches files from S3
     - `saveFileToS3`: Saves data to S3
     - `listFilesInS3`: Lists files in an S3 directory

2. **`routes.js`**
   - Defines RESTful API endpoints for S3 operations:
     - `GET /api/s3/file`: Retrieves a file from S3
     - `POST /api/s3/file`: Saves a file to S3
     - `GET /api/s3/list`: Lists files in an S3 directory

## AWS Lambda Integration

The application uses AWS Lambda functions for secure server-side operations:

### `update-standings-lambda.js`
- A Lambda function that safely updates standings data in S3
- Features:
  - Input validation
  - Error handling
  - Secure S3 operations
  - Logging for monitoring

## Deployment and Setup

### S3 Bucket Configuration
- The S3 bucket is configured with:
  - CORS settings to allow web access
  - Public read permissions
  - Appropriate IAM policies for write access

### Setup Scripts
1. **`setup-s3-bucket.sh`**
   - Creates and configures the S3 bucket
   - Sets up CORS and bucket policies
   - Uploads initial data files
   - Tests access to verify setup

2. **`test-s3.sh`**
   - Tests the local S3 integration
   - Provides guidance for production deployment

## Development vs. Production

### Development Environment
- `USE_LOCAL_FILES = true` in S3Service.js
- Uses local JSON files in `/public/s3-data/` directory
- Changes are simulated in localStorage

### Production Environment
- `USE_LOCAL_FILES = false` in S3Service.js
- Directly interacts with S3 bucket
- Requires proper AWS credentials and IAM permissions

## Security Considerations

- S3 bucket is publicly readable to allow frontend access
- Write operations are secured via:
  - Lambda functions with proper IAM roles
  - Server-side API endpoints with authentication
- IAM permissions are limited to necessary actions:
  - `s3:GetObject`: For reading data
  - `s3:PutObject`: For writing data
  - `s3:ListBucket`: For listing contents

## Performance Optimizations

- Direct S3 URL access for public read operations
- File caching for frequently accessed data
- Batch updates for standings to minimize write operations 