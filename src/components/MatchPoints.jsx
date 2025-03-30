import React, { useState, useEffect } from 'react';
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/aws-config';

function MatchPoints() {
  const [matchesData, setMatchesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const players = [
    'JAYAGAN ARMY',
    'JUSTIN CHALLENGERS',
    'Devilish 11',
    'CheemaRajah',
    'Sundar Night Fury',
    'Garuda Tejas',
    'Jais Royal Challengers',
    'Vjvignesh94',
    'Anantha Team'
  ];

  // Add team name mapping
  const teamShortNames = {
    'Royal Challengers Bengaluru': 'RCB',
    'Kolkata Knight Riders': 'KKR',
    'Chennai Super Kings': 'CSK',
    'Mumbai Indians': 'MI',
    'Sunrisers Hyderabad': 'SRH',
    'Rajasthan Royals': 'RR',
    'Delhi Capitals': 'DC',
    'Punjab Kings': 'PBKS',
    'Lucknow Super Giants': 'LSG',
    'Gujarat Titans': 'GT'
  };

  // Function to format match name
  const formatMatchName = (matchName) => {
    // Extract team names from the match name
    const teamRegex = /Match \d+: \d{2}-[A-Za-z]+-\d{2} - (.*?) vs (.*?)$/;
    const matches = matchName.match(teamRegex);
    
    if (matches && matches.length === 3) {
      const team1 = matches[1];
      const team2 = matches[2];
      return `${teamShortNames[team1] || team1} vs ${teamShortNames[team2] || team2}`;
    }
    
    // For playoff matches
    if (matchName.includes('Qualifier') || matchName.includes('Eliminator') || matchName.includes('Final')) {
      return matchName.split(':')[0]; // Return just "Qualifier 1", "Eliminator", etc.
    }
    
    return matchName;
  };

  useEffect(() => {
    fetchMatchPoints();
  }, []);

  const fetchMatchPoints = async () => {
    try {
      const params = {
        TableName: "IPL-fantasy-2025"
      };

      const { Items } = await ddbDocClient.send(new ScanCommand(params));
      const sortedMatches = Items.sort((a, b) => Number(a.matchId) - Number(b.matchId));
      setMatchesData(sortedMatches);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching match points:", error);
      setError("Failed to load match points");
      setLoading(false);
    }
  };

  const getMoneyClass = (points) => {
    if (!points) return '';
    
    const value = parseInt(points);
    
    if (value === 50) return 'money-50';
    if (value === 20) return 'money-20';
    if (value === 5) return 'money-5';
    if (value === 0) return 'money-0';
    if (value === -5) return 'money-neg-5';
    if (value === -10) return 'money-neg-10';
    if (value === -15) return 'money-neg-15';
    if (value === -20) return 'money-neg-20';
    if (value === -25) return 'money-neg-25';
    
    return '';
  };

  if (loading) return <div className="loading">Loading match points...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="match-points">
      <h2>Match Points</h2>
      <div className="points-table-container">
        <table className="points-table">
          <thead>
            <tr>
              <th>Match</th>
              {players.map(player => (
                <th key={player} colSpan="2">{player}</th>
              ))}
            </tr>
            <tr>
              <th></th>
              {players.map(player => (
                <React.Fragment key={player}>
                  <th>Dream11</th>
                  <th>₹</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {matchesData.map((match) => (
              <tr key={match.matchId}>
                <td>{formatMatchName(match.matchName)}</td>
                {players.map(player => {
                  const playerData = match.points[player] || {};
                  return (
                    <React.Fragment key={player}>
                      <td>{playerData.rawScore?.toFixed(1) || '-'}</td>
                      <td className={getMoneyClass(playerData.points)}>
                        {playerData.points ? `₹${playerData.points}` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatchPoints; 