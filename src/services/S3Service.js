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

export default {
  fetchJsonFromS3
}; 