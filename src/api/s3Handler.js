// S3 API handler for fetching and saving data
const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Function to get a file from S3
const getFileFromS3 = async (req, res) => {
  const { key } = req.query;
  
  if (!key) {
    return res.status(400).json({
      success: false,
      message: 'File key is required'
    });
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  try {
    const data = await s3.getObject(params).promise();
    const jsonData = JSON.parse(data.Body.toString('utf-8'));
    
    return res.json({
      success: true,
      data: jsonData
    });
  } catch (error) {
    // Handle case where file doesn't exist
    if (error.code === 'NoSuchKey') {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.error('Error fetching from S3:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving file from S3',
      error: error.message
    });
  }
};

// Function to save a file to S3
const saveFileToS3 = async (req, res) => {
  const { key, data } = req.body;
  
  if (!key || !data) {
    return res.status(400).json({
      success: false,
      message: 'File key and data are required'
    });
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json'
  };

  try {
    await s3.putObject(params).promise();
    
    return res.json({
      success: true,
      message: 'File saved successfully'
    });
  } catch (error) {
    console.error('Error saving to S3:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving file to S3',
      error: error.message
    });
  }
};

// Function to list files in a directory
const listFilesInS3 = async (req, res) => {
  const { prefix } = req.query;
  
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: prefix || ''
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    
    return res.json({
      success: true,
      files: data.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified
      }))
    });
  } catch (error) {
    console.error('Error listing S3 files:', error);
    return res.status(500).json({
      success: false,
      message: 'Error listing files in S3',
      error: error.message
    });
  }
};

module.exports = {
  getFileFromS3,
  saveFileToS3,
  listFilesInS3
}; 