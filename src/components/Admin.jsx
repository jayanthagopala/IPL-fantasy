import React, { useState, useEffect } from 'react';
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/aws-config';

function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [playerPoints, setPlayerPoints] = useState({});
  const [allMatchPoints, setAllMatchPoints] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const players = ['Jaya', 'Justin', 'Ram', 'Sibi', 'Sundar', 'Sampath', 'Jayanth', 'Vicky', 'Anantha'];
  
  const matches = [
    { id: 1, name: "Match 1: Mar 22 - CSK vs RCB" },
    { id: 2, name: "Match 2: Mar 23 - PBKS vs DC" },
    { id: 3, name: "Match 3: Mar 23 - KKR vs SRH" },
    { id: 4, name: "Match 4: Mar 24 - RR vs LSG" },
    { id: 5, name: "Match 5: Mar 24 - GT vs MI" },
    { id: 6, name: "Match 6: Mar 25 - RCB vs PBKS" },
    { id: 7, name: "Match 7: Mar 26 - CSK vs GT" },
    { id: 8, name: "Match 8: Mar 27 - SRH vs MI" },
    { id: 9, name: "Match 9: Mar 28 - RR vs DC" },
    { id: 10, name: "Match 10: Mar 29 - RCB vs KKR" },
    { id: 11, name: "Match 11: Mar 30 - LSG vs PBKS" },
    { id: 12, name: "Match 12: Mar 31 - GT vs SRH" },
    { id: 13, name: "Match 13: Mar 31 - DC vs CSK" },
    { id: 14, name: "Match 14: Apr 1 - MI vs RR" },
    { id: 15, name: "Match 15: Apr 2 - RCB vs LSG" },
    { id: 16, name: "Match 16: Apr 3 - DC vs KKR" },
    { id: 17, name: "Match 17: Apr 4 - GT vs PBKS" },
    { id: 18, name: "Match 18: Apr 5 - SRH vs CSK" },
    { id: 19, name: "Match 19: Apr 6 - RR vs RCB" },
    { id: 20, name: "Match 20: Apr 7 - MI vs DC" },
    { id: 21, name: "Match 21: Apr 8 - LSG vs GT" },
    { id: 22, name: "Match 22: Apr 9 - PBKS vs SRH" },
    { id: 23, name: "Match 23: Apr 10 - KKR vs CSK" },
    { id: 24, name: "Match 24: Apr 11 - MI vs RCB" },
    { id: 25, name: "Match 25: Apr 12 - RR vs GT" },
    { id: 26, name: "Match 26: Apr 13 - PBKS vs KKR" },
    { id: 27, name: "Match 27: Apr 14 - DC vs LSG" },
    { id: 28, name: "Match 28: Apr 15 - MI vs CSK" },
    { id: 29, name: "Match 29: Apr 16 - RCB vs SRH" },
    { id: 30, name: "Match 30: Apr 17 - PBKS vs RR" },
    { id: 31, name: "Match 31: Apr 18 - KKR vs LSG" },
    { id: 32, name: "Match 32: Apr 19 - DC vs GT" },
    { id: 33, name: "Match 33: Apr 20 - SRH vs PBKS" },
    { id: 34, name: "Match 34: Apr 21 - RR vs MI" },
    { id: 35, name: "Match 35: Apr 21 - CSK vs LSG" },
    { id: 36, name: "Match 36: Apr 22 - DC vs SRH" },
    { id: 37, name: "Match 37: Apr 23 - KKR vs RCB" },
    { id: 38, name: "Match 38: Apr 24 - MI vs PBKS" },
    { id: 39, name: "Match 39: Apr 25 - GT vs LSG" },
    { id: 40, name: "Match 40: Apr 26 - RCB vs CSK" },
    { id: 41, name: "Match 41: Apr 26 - KKR vs RR" },
    { id: 42, name: "Match 42: Apr 27 - RR vs PBKS" },
    { id: 43, name: "Match 43: Apr 28 - GT vs SRH" },
    { id: 44, name: "Match 44: Apr 29 - DC vs CSK" },
    { id: 45, name: "Match 45: Apr 30 - LSG vs RR" },
    { id: 46, name: "Match 46: May 1 - PBKS vs MI" },
    { id: 47, name: "Match 47: May 2 - LSG vs CSK" },
    { id: 48, name: "Match 48: May 3 - GT vs DC" },
    { id: 49, name: "Match 49: May 4 - SRH vs KKR" },
    { id: 50, name: "Match 50: May 5 - RR vs GT" },
    { id: 51, name: "Match 51: May 6 - PBKS vs CSK" },
    { id: 52, name: "Match 52: May 7 - MI vs LSG" },
    { id: 53, name: "Match 53: May 8 - DC vs RCB" },
    { id: 54, name: "Match 54: May 9 - GT vs KKR" },
    { id: 55, name: "Match 55: May 10 - PBKS vs RR" },
    { id: 56, name: "Match 56: May 11 - MI vs SRH" },
    { id: 57, name: "Match 57: May 12 - LSG vs KKR" },
    { id: 58, name: "Match 58: May 13 - DC vs PBKS" },
    { id: 59, name: "Match 59: May 14 - RCB vs GT" },
    { id: 60, name: "Match 60: May 14 - CSK vs SRH" },
    { id: 61, name: "Match 61: May 15 - LSG vs MI" },
    { id: 62, name: "Match 62: May 16 - DC vs RR" },
    { id: 63, name: "Match 63: May 17 - LSG vs SRH" },
    { id: 64, name: "Match 64: May 17 - RCB vs KKR" },
    { id: 65, name: "Match 65: May 17 - RR vs CSK" },
    { id: 66, name: "Match 66: May 18 - PBKS vs DC" },
    { id: 67, name: "Match 67: May 18 - MI vs GT" },
    { id: 68, name: "Match 68: May 18 - SRH vs RR" },
    { id: 69, name: "Match 69: May 18 - CSK vs PBKS" },
    { id: 70, name: "Match 70: May 18 - KKR vs MI" },
    { id: 71, name: "Qualifier 1: May 20 - 1st vs 2nd" },
    { id: 72, name: "Eliminator: May 21 - 3rd vs 4th" },
    { id: 73, name: "Qualifier 2: May 23 - Eliminator Winner vs Q1 Loser" },
    { id: 74, name: "Final: May 25 - Q1 Winner vs Q2 Winner" }
  ];

  // Load existing data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('matchPoints');
    if (savedData) {
      setAllMatchPoints(JSON.parse(savedData));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const savePointsToDynamoDB = async (matchData) => {
    try {
      const params = {
        TableName: "IPL-fantasy-2025",
        Item: {
          pk: `MATCH#${matchData.matchId}`,
          matchId: matchData.matchId,
          matchName: matchData.matchName,
          points: matchData.points,
          timestamp: new Date().toISOString()
        }
      };

      await ddbDocClient.send(new PutCommand(params));
      return true;
    } catch (error) {
      console.error("Error saving to DynamoDB:", error);
      throw new Error(error.message || 'Failed to save to database');
    }
  };

  const loadPointsFromDynamoDB = async (matchId) => {
    try {
      const params = {
        TableName: "IPL-fantasy-2025",
        Key: {
          pk: `MATCH#${matchId}`
        }
      };

      const { Item } = await ddbDocClient.send(new GetCommand(params));
      return Item;
    } catch (error) {
      console.error("Error loading from DynamoDB:", error);
      return null;
    }
  };

  const handleMatchSelect = async (e) => {
    const matchId = e.target.value;
    setSelectedMatch(matchId);
    
    if (matchId) {
      // Try to load points from DynamoDB
      const matchData = await loadPointsFromDynamoDB(matchId);
      if (matchData) {
        setPlayerPoints(matchData.points);
      } else {
        setPlayerPoints({});
      }
    } else {
      setPlayerPoints({});
    }
  };

  const handlePointsChange = (player, value) => {
    setPlayerPoints(prev => ({
      ...prev,
      [player]: {
        points: parseInt(value) || 0,
        prize: 0 // You can add prize input if needed
      }
    }));
  };

  const handleSavePoints = async () => {
    if (!selectedMatch) {
      setError('Please select a match first');
      setSuccessMessage('');
      return;
    }

    // Check if all players have points entered
    const hasAllPoints = players.every(player => playerPoints[player]?.points !== undefined);
    if (!hasAllPoints) {
      setError('Please enter points for all players');
      setSuccessMessage('');
      return;
    }

    const matchData = {
      matchId: selectedMatch,
      matchName: matches.find(m => m.id === parseInt(selectedMatch))?.name,
      points: playerPoints
    };

    try {
      // Save to DynamoDB
      const savedToDynamoDB = await savePointsToDynamoDB(matchData);
      
      if (savedToDynamoDB) {
        // Update local state
        const updatedMatchPoints = {
          ...allMatchPoints,
          [selectedMatch]: matchData
        };
        setAllMatchPoints(updatedMatchPoints);
        localStorage.setItem('matchPoints', JSON.stringify(updatedMatchPoints));
        
        // Clear form and show success message
        setSelectedMatch('');
        setPlayerPoints({});
        setError('');
        setSuccessMessage('Points saved successfully to DynamoDB!');

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        // Handle the case where save returned false
        setError('Failed to save points to DynamoDB');
        setSuccessMessage('');
      }
    } catch (error) {
      // Handle any errors that occur during the save process
      console.error('Save error:', error);
      setError(`Failed to save points: ${error.message || 'Unknown error occurred'}`);
      setSuccessMessage('');
    }
  };

  return (
    <div className="admin-panel">
      {!isAuthenticated ? (
        <div className="admin-login">
          <h2>Justin's Page - Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="password-input"
              />
            </div>
            <button type="submit" className="login-button">Login</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      ) : (
        <div className="admin-content">
          <h2>Match Points Entry</h2>
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="match-selector">
            <select 
              value={selectedMatch} 
              onChange={handleMatchSelect}
              className="match-dropdown"
            >
              <option value="">Select a match</option>
              {matches.map(match => (
                <option key={match.id} value={match.id}>
                  {match.name}
                </option>
              ))}
            </select>
          </div>

          {selectedMatch && (
            <div className="points-entry-form">
              <h3>Enter Points</h3>
              <div className="players-grid">
                {players.map(player => (
                  <div key={player} className="player-input">
                    <label>{player}</label>
                    <input
                      type="number"
                      value={playerPoints[player]?.points || ''}
                      onChange={(e) => handlePointsChange(player, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={handleSavePoints}
                className="save-button"
              >
                Save Points
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin; 