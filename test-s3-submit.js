// Test script to simulate the submission of Match 4 data to S3
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// S3 bucket details
const REGION = 'eu-west-1';
const BUCKET_NAME = 'ipl-fantasy-data-2025';

// Initialize S3 client
const s3Client = new S3Client({ region: REGION });

// Sample data for Match 4
const matchData = {
  matchNo: 4,
  match_info: {
    team_1: "Delhi Capitals",
    team_2: "Punjab Kings",
    team_1_score: "190-6 (20)",
    team_2_score: "182-9 (20)",
    result: "DC beat PBKS by 8 runs"
  },
  leaderboard: [
    { team_name: "Garuda Tejas", points: 147, rank: 1 },
    { team_name: "Vjvignesh94", points: 135, rank: 2 },
    { team_name: "Sundar Night Fury", points: 128, rank: 3 },
    { team_name: "JUSTIN CHALLENGERS", points: 118, rank: 4 },
    { team_name: "Anantha Team", points: 110, rank: 5 },
    { team_name: "CheemsRajah", points: 105, rank: 6 },
    { team_name: "JAYAGAN ARMY", points: 98, rank: 7 },
    { team_name: "Devilish 11", points: 92, rank: 8 },
    { team_name: "Jais Royal Challengers", points: 85, rank: 9 }
  ]
};

// Function to fetch the current standings from S3
async function fetchCurrentStandings() {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: 'game-standings.json',
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    // Convert the response stream to text
    const bodyContents = await streamToString(response.Body);
    
    // Parse the text as JSON
    return JSON.parse(bodyContents);
  } catch (error) {
    console.error(`Error fetching standings: ${error.message}`);
    throw error;
  }
}

// Function to update standings with new match data
export async function updateStandings(matchNo, data) {
  try {
    // Fetch the current standings
    const gameStandings = await fetchCurrentStandings();
    
    // Ensure the standings array exists
    if (!gameStandings.standings) {
      gameStandings.standings = [];
    }
    
    // Find if there's already data for this match
    const existingMatchIndex = gameStandings.standings.findIndex(
      match => match && match.matchNo === matchNo
    );
    
    // Convert the new data to the format expected by the standings JSON
    const formattedData = {
      matchNo,
      match_info: data.match_info,
      teams: data.leaderboard.map(item => ({
        teamName: item.team_name,
        points: item.points,
        rank: item.rank,
        ...(item.note && { note: item.note })
      }))
    };
    
    // Update or append the match data
    if (existingMatchIndex !== -1) {
      gameStandings.standings[existingMatchIndex] = formattedData;
    } else {
      gameStandings.standings.push(formattedData);
    }
    
    console.log("Updated standings data:", gameStandings);
    
    // Save to S3
    const params = {
      Bucket: BUCKET_NAME,
      Key: 'game-standings.json',
      Body: JSON.stringify(gameStandings, null, 2),
      ContentType: 'application/json'
    };
    
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log('Successfully saved standings to S3');
    
    return true;
  } catch (error) {
    console.error(`Error saving leaderboard data: ${error.message}`);
    throw error;
  }
}

// Helper function to convert stream to string
const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
};

// Execute the test
async function runTest() {
  try {
    console.log("Starting S3 submission test for Match 4...");
    
    // Update standings with Match 4 data
    await updateStandings(matchData.matchNo, matchData);
    
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Only run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest();
} 