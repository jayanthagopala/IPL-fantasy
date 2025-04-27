# S3 Integration in IPL Fantasy Application

## Overview
The application uses AWS S3 to store and retrieve JSON data for the IPL fantasy league. The primary files involved in S3 integration are:

1. `src/services/S3Service.js` - Core service for S3 operations
2. `src/components/Standings.jsx` - Displays overall standings using S3 data
3. `src/components/Schedule.jsx` - Shows match schedule and results using S3 data
4. `setup-s3-bucket.sh` - Script to set up the S3 bucket and initial data

## S3Service.js
This is the main service that handles all S3 interactions. Key features:

- Configurable to use either local files (for development) or S3 (for production)
- Uses AWS SDK for JavaScript to interact with S3
- Provides functions to fetch JSON data from S3 and save data to S3
- Handles errors and provides logging

### Key Functions:
- `fetchJsonFromS3(key)`: Fetches JSON data from S3 or local directory
- `saveLeaderboardData(matchData)`: Saves match data to the leaderboard file

## Usage in Components

### Standings Component
- Imports `fetchJsonFromS3` from S3Service
- Fetches standings data from the `game-standings.json` file
- Processes the data to calculate overall standings
- Displays the results in a formatted table with rankings and prize money

### Schedule Component
- Imports `fetchJsonFromS3` from S3Service
- Fetches two JSON files:
  - `ipl-schedule-json.json` for match schedule information
  - `game-standings.json` for match results and fantasy points
- Displays matches grouped by month with expandable details
- Shows fantasy points and earnings for each team in a match

## S3 Bucket Setup
The `setup-s3-bucket.sh` script handles:

- Creating the S3 bucket if it doesn't exist
- Setting up CORS configuration for cross-origin requests
- Configuring bucket policy for public read access
- Uploading initial data files:
  - `empty-standings.json`
  - `ipl-schedule-json.json`
- Testing accessibility of uploaded files
- Providing reminders to update S3Service.js with production settings

## S3 Files Structure
The application uses the following files in S3:

1. `game-standings.json` - Contains match results and team standings
2. `ipl-schedule-json.json` - Contains the IPL match schedule

## Development vs Production
The application can switch between local development and production S3 usage:

- In development: Set `USE_LOCAL_FILES = true` in S3Service.js to use local JSON files
- In production: Set `USE_LOCAL_FILES = false` to use real S3 bucket data

## Error Handling
- Both components handle loading states and errors when fetching from S3
- The S3Service includes proper try/catch blocks and error logging 