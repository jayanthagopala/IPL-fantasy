import React, { useState, useEffect } from 'react';
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/aws-config';

function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    calculateStandings();
  }, []);

  const calculateStandings = async () => {
    try {
      const params = {
        TableName: "IPL-fantasy-2025"
      };

      const { Items } = await ddbDocClient.send(new ScanCommand(params));
      
      // Calculate total money and Dream11 points for each player
      const totals = {};
      
      Items.forEach(match => {
        Object.entries(match.points || {}).forEach(([player, data]) => {
          if (!totals[player]) {
            totals[player] = {
              money: 0,
              dream11Points: 0
            };
          }
          totals[player].money += data.points || 0;
          totals[player].dream11Points += data.rawScore || 0;
        });
      });

      // Convert to array and sort by money (descending)
      const standingsArray = Object.entries(totals)
        .map(([player, data]) => ({
          player,
          money: data.money,
          dream11Points: parseFloat(data.dream11Points.toFixed(1))
        }))
        .sort((a, b) => b.money - a.money);

      setStandings(standingsArray);
      setLoading(false);
    } catch (error) {
      console.error("Error calculating standings:", error);
      setError("Failed to load standings");
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading standings...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="standings-container">
      <h2 className="standings-title">🏆 Fantasy Standings</h2>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Dream11 Points 🎮</th>
            <th>Total Money 💰</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((item, index) => (
            <tr key={item.player} className="standings-row">
              <td className="rank-cell">
                {index === 0 && "🥇"}
                {index === 1 && "🥈"}
                {index === 2 && "🥉"}
                {index > 2 && `#${index + 1}`}
              </td>
              <td className="team-cell">{item.player}</td>
              <td className="points-cell">{item.dream11Points} pts</td>
              <td className={`money-cell ${item.money >= 0 ? 'positive' : 'negative'}`}>
                {item.money >= 0 ? '↗' : '↙'} ₹{Math.abs(item.money)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Standings; 