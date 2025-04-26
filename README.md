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