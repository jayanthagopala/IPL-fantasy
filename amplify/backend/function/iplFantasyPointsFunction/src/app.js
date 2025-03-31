const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

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

// Add other CRUD operations as needed