import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 bucket details
const REGION = 'eu-west-1';  // Update to match your AWS region
const BUCKET_NAME = 'ipl-fantasy-data-2025';

// Flag to determine if we should use local files for testing
const USE_LOCAL_FILES = false; // Set to false when deploying to production

// Initialize S3 client if not using local files
const s3Client = !USE_LOCAL_FILES ? new S3Client({ region: REGION }) : null;

/**
 * Fetch JSON data from an S3 object or local directory for testing
 * @param {string} key - The S3 object key (file path)
 * @returns {Promise<Object>} - The parsed JSON data
 */
export const fetchJsonFromS3 = async (key) => {
  try {
    if (USE_LOCAL_FILES) {
      // For local testing - read from s3-data directory
      // This simulates S3 without requiring actual AWS credentials
      console.log(`Reading local file from s3-data/${key}`);
      
      // In a real environment, we'd use Node.js file system
      // But in browser, we'll use fetch to access local files
      const response = await fetch(`/s3-data/${key}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch local file: ${response.statusText}`);
      }
      
      return await response.json();
    } else {
      // For production - directly access the S3 file via URL
      // This works because we've made the bucket publicly readable
      const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
      console.log(`Fetching from S3 URL: ${publicUrl}`);
      
      const response = await fetch(publicUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from S3: ${response.statusText}`);
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error(`Error fetching JSON from S3: ${error.message}`);
    throw error;
  }
};

/**
 * Save leaderboard data for a specific match
 * @param {number} matchNo - The match number
 * @param {Object} data - The match data including match_info and leaderboard
 * @returns {Promise<boolean>} - Whether the save was successful
 */
export const saveLeaderboardData = async (matchNo, data) => {
  try {
    // Fetch the current game standings (either from local or S3)
    const gameStandings = await fetchJsonFromS3('game-standings.json');
    
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
    
    if (USE_LOCAL_FILES) {
      // For local testing, save to localStorage
      console.log(`Would save to S3: game-standings.json`);
      localStorage.setItem('game-standings', JSON.stringify(gameStandings));
    } else {
      // In production, save to S3 directly
      const params = {
        Bucket: BUCKET_NAME,
        Key: 'game-standings.json',
        Body: JSON.stringify(gameStandings, null, 2),
        ContentType: 'application/json'
      };
      
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      console.log('Successfully saved standings to S3');
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving leaderboard data: ${error.message}`);
    throw error;
  }
};

/**
 * Convert a readable stream to a string
 * @param {ReadableStream} stream - The stream to convert
 * @returns {Promise<string>} - The string result
 */
const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
}; 