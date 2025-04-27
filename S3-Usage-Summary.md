# S3 Usage in IPL Fantasy Application

## Overview
The IPL Fantasy application uses AWS S3 to store and retrieve JSON data that is essential for the application's functionality. The application directly interacts with S3 from the frontend for better performance and reliability.

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

## Data Management UI

### `LeaderboardSubmission.jsx`
- Provides a UI for updating match results and fantasy points
- Features:
  - Match selection dropdown
  - JSON data editor
  - Validation of input data
  - Preview of changes before submission
  - Error handling and success notifications
- Uses the S3Service directly to fetch and update data in S3

## Deployment and Setup

### S3 Bucket Configuration
- The S3 bucket is configured with:
  - CORS settings to allow web access from any origin
  - Public read permissions for all files
  - Write permissions controlled via IAM roles

### Bucket Setup Script
The S3 bucket can be set up using AWS CLI:

```bash
# Create the bucket
aws s3 mb s3://ipl-fantasy-data-2025 --region eu-west-1

# Configure CORS
aws s3api put-bucket-cors --bucket ipl-fantasy-data-2025 --cors-configuration file://cors.json

# Set up public read access
aws s3api put-bucket-policy --bucket ipl-fantasy-data-2025 --policy file://bucket-policy.json

# Upload initial data files
aws s3 cp public/s3-data/game-standings.json s3://ipl-fantasy-data-2025/game-standings.json --content-type application/json
aws s3 cp public/s3-data/ipl-schedule-json.json s3://ipl-fantasy-data-2025/ipl-schedule-json.json --content-type application/json
```

## Development vs. Production

### Development Environment
- `USE_LOCAL_FILES = true` in S3Service.js
- Uses local JSON files in `/public/s3-data/` directory
- Changes are simulated in localStorage

### Production Environment
- `USE_LOCAL_FILES = false` in S3Service.js
- Directly interacts with S3 bucket
- Requires an S3 bucket with the correct permissions

## Security Considerations

- S3 bucket is publicly readable to allow frontend access
- Write operations are secured via AWS SDK credentials
- AWS SDK uses the application's Amplify credentials for authenticated S3 access

## Performance Optimizations

- Direct S3 URL access for public read operations
- Client-side caching for frequently accessed data
- Batch updates for standings to minimize write operations 