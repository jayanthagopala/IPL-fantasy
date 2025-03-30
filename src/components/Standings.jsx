import React, { useState, useEffect } from 'react';
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/aws-config';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Standings() {
  const [standings, setStandings] = useState([]);
  const [progressionData, setProgressionData] = useState(null);
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
      const sortedMatches = Items.sort((a, b) => Number(a.matchId) - Number(b.matchId));
      
      // Calculate cumulative totals for each player
      const playerProgression = {};
      const matchLabels = [];

      sortedMatches.forEach(match => {
        matchLabels.push(`Match ${match.matchId}`);
        Object.entries(match.points || {}).forEach(([player, data]) => {
          if (!playerProgression[player]) {
            playerProgression[player] = {
              data: [],
              total: 0
            };
          }
          playerProgression[player].total += data.points || 0;
          playerProgression[player].data.push(playerProgression[player].total);
        });
      });

      // Prepare chart data
      const chartData = {
        labels: matchLabels,
        datasets: Object.entries(playerProgression).map(([player, data], index) => ({
          label: player,
          data: data.data,
          borderColor: getPlayerColor(index),
          backgroundColor: getPlayerColor(index),
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6
        }))
      };

      setProgressionData(chartData);

      // Calculate final standings
      const standingsArray = Object.entries(playerProgression)
        .map(([player, data]) => ({
          player,
          money: data.total,
          dream11Points: calculateDream11Points(player, sortedMatches)
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

  const calculateDream11Points = (player, matches) => {
    return matches.reduce((total, match) => {
      return total + (match.points[player]?.rawScore || 0);
    }, 0);
  };

  const getPlayerColor = (index) => {
    const colors = [
      '#2563eb', '#dc2626', '#059669', '#d97706', 
      '#7c3aed', '#db2777', '#0891b2', '#4f46e5',
      '#ea580c'
    ];
    return colors[index % colors.length];
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            family: 'Poppins',
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e40af',
        bodyColor: '#1e40af',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: 'Poppins'
        },
        titleFont: {
          family: 'Poppins',
          weight: 600
        },
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ₹${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Poppins',
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: '#e2e8f0'
        },
        ticks: {
          font: {
            family: 'Poppins',
            size: 12
          },
          callback: (value) => `₹${value}`
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
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
      
      <div className="standings-chart-container">
        <h3 className="chart-title">Money Progression</h3>
        <div className="chart-wrapper">
          {progressionData && (
            <Line data={progressionData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Standings; 