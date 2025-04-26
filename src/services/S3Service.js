import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// S3 bucket details
const REGION = 'eu-west-1';  // Update to match your AWS region
const BUCKET_NAME = 'ipl-fantasy-data-2025';

// Flag to determine if we should use local files for testing
const USE_LOCAL_FILES = true; // Set to false when deploying to production

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
      // Real S3 implementation for production
      // Set up the parameters for fetching the object
      const params = {
        Bucket: BUCKET_NAME,
        Key: key,
      };

      // Get the object from S3
      const command = new GetObjectCommand(params);
      const response = await s3Client.send(command);

      // Convert the response stream to text
      const bodyContents = await streamToString(response.Body);
      
      // Parse the text as JSON
      return JSON.parse(bodyContents);
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
    // In local development, simulate saving to localStorage
    if (USE_LOCAL_FILES) {
      // Fetch the current game standings
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
      
      // In real implementation, this would upload the file to S3
      // For local testing, we'll just log that it would be saved
      console.log(`Would save to S3: game-standings.json`);
      
      // Save to localStorage for demo purposes
      localStorage.setItem('game-standings', JSON.stringify(gameStandings));
      
      return true;
    } else {
      // In production, this would use AWS SDK to upload to S3
      // This would typically be done via a Lambda function or backend API
      // as direct S3 uploads from the browser have security implications
      
      // For now, we'll just return a simulated success
      console.warn("Production S3 upload not implemented yet");
      return true;
    }
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