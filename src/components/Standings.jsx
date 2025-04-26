import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use dummy data instead of API call
    const dummyStandings = [
      { player: 'JAYAGAN ARMY', dream11Points: 1250, money: 150 },
      { player: 'JUSTIN CHALLENGERS', dream11Points: 1200, money: 120 },
      { player: 'Devilish 11', dream11Points: 1150, money: 80 },
      { player: 'CheemaRajah', dream11Points: 1100, money: 50 },
      { player: 'Sundar Night Fury', dream11Points: 1050, money: 20 },
      { player: 'Garuda Tejas', dream11Points: 1000, money: -10 },
      { player: 'Jais Royal Challengers', dream11Points: 950, money: -20 },
      { player: 'Vjvignesh94', dream11Points: 900, money: -30 },
      { player: 'Anantha Team', dream11Points: 850, money: -40 }
    ];

    // Create dummy progression data
    const dummyProgressionData = {
      labels: ['Match 1', 'Match 2', 'Match 3', 'Match 4', 'Match 5'],
      datasets: dummyStandings.map((player, index) => ({
        label: player.player,
        data: [0, 20, 40, 60, player.money],
        borderColor: getPlayerColor(index),
        tension: 0.1
      }))
    };

    setStandings(dummyStandings);
    setProgressionData(dummyProgressionData);
  }, []);

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