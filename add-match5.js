// Script to add Match 5 data to S3
import { updateStandings } from './test-s3-submit.js';
import fs from 'fs';

async function addMatch5() {
  try {
    console.log("Adding Match 5 data to S3...");
    
    // Read the match 5 data from JSON file
    const data = JSON.parse(fs.readFileSync('./test-match5-data.json', 'utf8'));
    
    // Update standings with Match 5 data
    await updateStandings(data.matchNo, data);
    
    console.log("Successfully added Match 5 data!");
  } catch (error) {
    console.error("Failed to add Match 5 data:", error);
  }
}

// Run the script
addMatch5(); 