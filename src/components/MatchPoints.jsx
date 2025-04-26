import React, { useState, useEffect } from 'react';

function MatchPoints() {
  const [matchesData, setMatchesData] = useState([]);
  const [loading, setLoading] = useState(false);
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
    // Create dummy match data
    const dummyMatches = [
      {
        matchId: '1',
        matchName: 'Match 1: RCB vs MI',
        points: {
          'JAYAGAN ARMY': { rawScore: 120.5, points: 50 },
          'JUSTIN CHALLENGERS': { rawScore: 110.2, points: 20 },
          'Devilish 11': { rawScore: 105.8, points: 5 },
          'CheemaRajah': { rawScore: 100.1, points: 0 },
          'Sundar Night Fury': { rawScore: 95.3, points: -5 },
          'Garuda Tejas': { rawScore: 90.7, points: -10 },
          'Jais Royal Challengers': { rawScore: 85.2, points: -15 },
          'Vjvignesh94': { rawScore: 80.6, points: -20 },
          'Anantha Team': { rawScore: 75.9, points: -25 }
        }
      },
      {
        matchId: '2',
        matchName: 'Match 2: CSK vs KKR',
        points: {
          'JAYAGAN ARMY': { rawScore: 115.3, points: 20 },
          'JUSTIN CHALLENGERS': { rawScore: 125.7, points: 50 },
          'Devilish 11': { rawScore: 110.2, points: 5 },
          'CheemaRajah': { rawScore: 105.8, points: 0 },
          'Sundar Night Fury': { rawScore: 100.1, points: -5 },
          'Garuda Tejas': { rawScore: 95.3, points: -10 },
          'Jais Royal Challengers': { rawScore: 90.7, points: -15 },
          'Vjvignesh94': { rawScore: 85.2, points: -20 },
          'Anantha Team': { rawScore: 80.6, points: -25 }
        }
      }
    ];

    setMatchesData(dummyMatches);
  }, []);

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
                <td>{match.matchName}</td>
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