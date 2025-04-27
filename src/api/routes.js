const express = require('express');
const { getFileFromS3, saveFileToS3, listFilesInS3 } = require('./s3Handler');

const router = express.Router();

// S3 routes
router.get('/s3/file', getFileFromS3);
router.post('/s3/file', saveFileToS3);
router.get('/s3/list', listFilesInS3);

module.exports = router; 