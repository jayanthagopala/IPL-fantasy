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