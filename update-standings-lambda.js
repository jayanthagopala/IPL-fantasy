/**
 * IPL Fantasy Standings Updater Lambda Function
 * 
 * This Lambda function receives fantasy standings data and updates
 * the standings in an S3 bucket. It's designed to securely process
 * and store IPL fantasy game standings.
 */

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-west-1' });

// Configuration from environment variables
const BUCKET_NAME = process.env.S3_BUCKET || 'ipl-fantasy-data-2025';
const STANDINGS_FILE = process.env.STANDINGS_FILE || 'game-standings.json';

/**
 * Main Lambda handler function
 * 
 * @param {Object} event - Lambda event object
 * @param {number} event.matchNo - Match number
 * @param {Array} event.leaderboard - Array of player standings
 * @returns {Object} Response with status and message
 */
exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    try {
        // Validate input data
        if (!event.matchNo || !event.leaderboard || !Array.isArray(event.leaderboard)) {
            throw new Error('Invalid input: matchNo and leaderboard array are required');
        }

        // Extract data from event
        const matchNo = event.matchNo;
        const leaderboard = event.leaderboard;
        
        // Validate leaderboard entries
        for (const entry of leaderboard) {
            if (!entry.username || typeof entry.points !== 'number' || typeof entry.rank !== 'number') {
                throw new Error('Invalid leaderboard entry: each entry must have username, points, and rank');
            }
        }
        
        // Get current standings if they exist
        let currentStandings = await getCurrentStandings();
        
        // Update standings with new data
        currentStandings = updateStandings(currentStandings, matchNo, leaderboard);
        
        // Save updated standings back to S3
        await saveStandings(currentStandings);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Standings updated successfully',
                matchNo: matchNo,
                entriesProcessed: leaderboard.length
            })
        };
    } catch (error) {
        console.error('Error processing standings update:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error updating standings',
                error: error.message
            })
        };
    }
};

/**
 * Fetches current standings from S3
 * 
 * @returns {Object} Current standings data
 */
async function getCurrentStandings() {
    try {
        const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: STANDINGS_FILE
        });
        
        const response = await s3Client.send(getCommand);
        const body = await streamToString(response.Body);
        return JSON.parse(body);
    } catch (error) {
        // If file doesn't exist, return empty standings object
        if (error.name === 'NoSuchKey') {
            return {
                lastUpdated: new Date().toISOString(),
                lastMatch: 0,
                standings: []
            };
        }
        throw error;
    }
}

/**
 * Convert readable stream to string
 * 
 * @param {ReadableStream} stream - S3 response stream
 * @returns {Promise<string>} String content from stream
 */
async function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
}

/**
 * Updates the standings with new leaderboard data
 * 
 * @param {Object} currentStandings - Current standings data
 * @param {number} matchNo - Match number
 * @param {Array} leaderboard - New leaderboard data
 * @returns {Object} Updated standings
 */
function updateStandings(currentStandings, matchNo, leaderboard) {
    // Create new standings object if none exists
    if (!currentStandings) {
        currentStandings = {
            lastUpdated: new Date().toISOString(),
            lastMatch: 0,
            standings: []
        };
    }
    
    // Only update if this is a newer match
    if (matchNo < currentStandings.lastMatch) {
        console.log(`Ignoring older match data (Match ${matchNo})`);
        return currentStandings;
    }
    
    // Update standings
    currentStandings.lastUpdated = new Date().toISOString();
    currentStandings.lastMatch = matchNo;
    
    // Merge new leaderboard with existing standings or replace entirely
    if (matchNo > currentStandings.lastMatch) {
        // New match, replace standings
        currentStandings.standings = leaderboard;
    } else {
        // Same match, update existing entries and add new ones
        const existingUsernames = new Set(currentStandings.standings.map(entry => entry.username));
        
        for (const entry of leaderboard) {
            if (existingUsernames.has(entry.username)) {
                // Update existing entry
                const existingIndex = currentStandings.standings.findIndex(e => e.username === entry.username);
                currentStandings.standings[existingIndex] = entry;
            } else {
                // Add new entry
                currentStandings.standings.push(entry);
            }
        }
        
        // Sort by rank
        currentStandings.standings.sort((a, b) => a.rank - b.rank);
    }
    
    return currentStandings;
}

/**
 * Saves standings data to S3
 * 
 * @param {Object} standings - Standings data to save
 * @returns {Promise<Object>} S3 response
 */
async function saveStandings(standings) {
    const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: STANDINGS_FILE,
        Body: JSON.stringify(standings, null, 2),
        ContentType: 'application/json'
    });
    
    return s3Client.send(putCommand);
} 