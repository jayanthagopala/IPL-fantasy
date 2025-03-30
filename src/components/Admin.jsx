import React, { useState, useEffect } from 'react';
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/aws-config';
import iplSchedule from '../components/ipl-schedule-json.json';

function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [playerPoints, setPlayerPoints] = useState({});
  const [allMatchPoints, setAllMatchPoints] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const players = ['Jaya', 'Justin', 'Ram', 'Sibi', 'Sundar', 'Sampath', 'Jayanth', 'Vicky', 'Anantha'];
  
  const matches = iplSchedule.matches.map(match => ({
    id: match.matchNo,
    name: `Match ${match.matchNo}: ${match.date} - ${match.homeTeam} vs ${match.awayTeam}`
  }));

  const rankToPoints = {
    1: 50,
    2: 20,
    3: 5,
    4: 0,
    5: -5,
    6: -10,
    7: -15,
    8: -20,
    9: -25
  };

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

  const calculateRankPoints = (rawScores) => {
    // Convert scores object to array of {player, score} objects
    const scoresArray = Object.entries(rawScores).map(([player, value]) => ({
      player,
      score: Number(value.points || 0)
    }));

    // Sort by score in descending order
    scoresArray.sort((a, b) => b.score - a.score);

    // Assign ranks and corresponding points
    const rankedPoints = {};
    scoresArray.forEach((entry, index) => {
      const rank = index + 1;
      rankedPoints[entry.player] = {
        points: rankToPoints[rank] || -25, // default to -25 for any rank beyond 9
        rawScore: entry.score
      };
    });

    return rankedPoints;
  };

  const handleSavePoints = async () => {
    try {
      if (!selectedMatch) {
        setError('Please select a match first');
        return;
      }

      // Calculate ranked points based on raw scores
      const rankedPoints = calculateRankPoints(playerPoints);

      const matchData = {
        matchId: selectedMatch,
        matchName: matches.find(m => m.id.toString() === selectedMatch)?.name || '',
        points: rankedPoints,
        timestamp: new Date().toISOString()
      };

      await savePointsToDynamoDB(matchData);
      
      // Clear form and show success message
      setPlayerPoints({});
      setSuccessMessage('Points saved successfully!');
      setError('');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('Save error:', error);
      setError(error.message || 'Failed to save points');
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
              <h3>Enter Raw Scores</h3>
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
                    {playerPoints[player]?.points && (
                      <div className="calculated-points">
                        Final Points: {calculateRankPoints(playerPoints)[player]?.points || 0}
                      </div>
                    )}
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