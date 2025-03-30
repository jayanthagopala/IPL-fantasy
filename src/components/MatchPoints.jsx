import React from 'react';

function MatchPoints() {
  const players = ['Jaya', 'Justin', 'Ram', 'Sibi', 'Sundar', 'Sampath', 'Jayanth', 'Vicky', 'Anantha'];
  
  const matches = [
    {
      id: 1,
      format: 1,
      match: "KKR vs RCB",
      points: {
        Jaya: { points: 0, prize: 70 },
        Justin: { points: 20, prize: 90 },
        Ram: { points: -10, prize: 50 },
        Sibi: { points: -15, prize: 40 },
        Sundar: { points: -5, prize: 80 },
        Sampath: { points: -25, prize: 0 },
        Jayanth: { points: -20, prize: 30 },
        Vicky: { points: 50, prize: 100 },
        Anantha: { points: 50, prize: 100 }
      }
    },
    {
      id: 2,
      format: 1,
      match: "SRH vs RR",
      points: {
        Jaya: { points: 0, prize: 80 },
        Justin: { points: -5, prize: 60 },
        Ram: { points: -15, prize: 40 },
        Sibi: { points: 20, prize: 90 },
        Sundar: { points: 25, prize: 0 },
        Sampath: { points: 20, prize: 90 },
        Jayanth: { points: 50, prize: 100 },
        Vicky: { points: -10, prize: 50 },
        Anantha: { points: 0, prize: 70 }
      }
    }
  ];

  return (
    <div className="match-points">
      <h2>Next Gen DREAM 11</h2>
      <div className="match-points-table-container">
        <table className="match-points-table">
          <thead>
            <tr>
              <th>Match no.</th>
              <th>Format</th>
              <th>Match</th>
              {players.map(player => (
                <th key={player} className="player-column">
                  <div className="player-name">{player}</div>
                  <div className="points-prize-header">
                    <span>Points</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.map(match => (
              <tr key={match.id}>
                <td>{match.id}</td>
                <td>{match.format}</td>
                <td className="match-name">{match.match}</td>
                {players.map(player => (
                  <td key={player} className="points-cell">
                    <div className={`points ${match.points[player].points >= 0 ? 'positive' : 'negative'}`}>
                      {match.points[player].points}
                    </div>
                    <div className="prize">{match.points[player].prize}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatchPoints; 