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
              <th></th> {/* Empty cell for match column */}
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
                <td>{match.matchName}</td>
                {players.map(player => {
                  const playerData = match.points[player] || {};
                  return (
                    <React.Fragment key={player}>
                      <td>{playerData.rawScore?.toFixed(1) || '-'}</td>
                      <td className={playerData.points > 0 ? 'positive' : playerData.points < 0 ? 'negative' : ''}>
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