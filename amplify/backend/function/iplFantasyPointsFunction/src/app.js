const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const app = express();
app.use(bodyParser.json());

app.get('/items', async function(req, res) {
  const params = {
    TableName: "IPL-fantasy-2025"
  };
  
  try {
    const data = await docClient.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add POST route for /item
app.post('/item', async function(req, res) {
  console.log('Received POST request to /item:', req.body);
  
  try {
    // You can add database operations here
    // For now, just echo back the request
    res.json({
      success: true,
      message: 'Item received',
      data: req.body
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add other CRUD operations as needed

module.exports = app;