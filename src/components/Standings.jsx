import React, { useState, useEffect } from 'react';
import { fetchJsonFromS3 } from '../services/S3Service';
import './Standings.css';

const Standings = () => {
  const [overallStandings, setOverallStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [standingsData, setStandingsData] = useState(null);

  useEffect(() => {
    const loadStandingsData = async () => {
      try {
        setIsLoading(true);
        // Fetch standings data from S3
        const data = await fetchJsonFromS3('game-standings.json');
        setStandingsData(data);
        
        if (!data || !data.standings || !Array.isArray(data.standings)) {
          setError('No standings data available');
          setIsLoading(false);
          return;
        }

        // Calculate overall standings by summing points across all matches
        const teamPointsMap = {};
        const teamMatchesMap = {};
        
        // Process all matches
        data.standings.forEach(match => {
          if (match && match.teams && Array.isArray(match.teams)) {
            match.teams.forEach(team => {
              if (team && team.teamName) {
                // Initialize team in map if not exists
                if (!teamPointsMap[team.teamName]) {
                  teamPointsMap[team.teamName] = 0;
                  teamMatchesMap[team.teamName] = 0;
                }
                
                // Add points from this match
                teamPointsMap[team.teamName] += team.points;
                teamMatchesMap[team.teamName] += 1;
              }
            });
          }
        });
        
        // Convert to array for sorting
        const teamsArray = Object.keys(teamPointsMap).map(teamName => ({
          teamName,
          totalPoints: teamPointsMap[teamName],
          matchesPlayed: teamMatchesMap[teamName],
          avgPoints: Math.round(teamPointsMap[teamName] / teamMatchesMap[teamName])
        }));
        
        // Sort by total points (descending)
        teamsArray.sort((a, b) => b.totalPoints - a.totalPoints);
        
        // Assign ranks
        teamsArray.forEach((team, index) => {
          team.rank = index + 1;
        });
        
        setOverallStandings(teamsArray);
        setIsLoading(false);
      } catch (err) {
        setError('Error loading standings data: ' + err.message);
        setIsLoading(false);
        console.error('Error loading standings:', err);
      }
    };

    loadStandingsData();
  }, []);

  // Function to determine prize money based on rank
  const calculatePrizeMoney = (rank) => {
    switch(rank) {
      case 1: return '₹50,000';
      case 2: return '₹30,000';
      case 3: return '₹15,000';
      default: return '₹0';
    }
  };

  if (isLoading) {
    return <div className="loading">Loading standings data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="standings-container">
      <h1>Overall Standings</h1>
      
      <div className="standings-table-container">
        <table className="standings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Total Points</th>
              <th>Matches</th>
              <th>Avg Points</th>
              <th>Prize Money</th>
            </tr>
          </thead>
          <tbody>
            {overallStandings.map((team) => (
              <tr key={team.teamName} className={team.rank <= 3 ? 'top-team' : ''}>
                <td className="rank">{team.rank}</td>
                <td className="team-name">{team.teamName}</td>
                <td className="total-points">{team.totalPoints}</td>
                <td className="matches-played">{team.matchesPlayed}</td>
                <td className="avg-points">{team.avgPoints}</td>
                <td className="prize-money">{calculatePrizeMoney(team.rank)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="matches-info">
        <p>Total Matches Processed: {standingsData?.standings?.length || 0}</p>
      </div>
    </div>
  );
};

export default Standings; 