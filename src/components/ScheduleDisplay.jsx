import React, { useState } from 'react';
import scheduleJson from './ipl-schedule-json.json';

const ScheduleDisplay = () => {
  const [expandedMatch, setExpandedMatch] = useState(null);
  
  // Teams for the leaderboard
  const teams = [
    "Anantha Team",
    "JUSTIN CHALLENGERS",
    "Sundar Night Fury",
    "JAYAGAN ARMY", 
    "Vjvignesh94",
    "Devilish 11",
    "CheemsRajah",
    "Jais Royal Challengers",
    "Garuda Tejas"
  ];
  
  // Toggle match expansion
  const toggleMatch = (matchNo) => {
    if (expandedMatch === matchNo) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchNo);
    }
  };
  
  // Generate random points for demonstration
  const generateRandomPoints = () => {
    return Math.floor(Math.random() * 100) + 50; // Random points between 50-150
  };
  
  // Generate leaderboard data for a match
  const generateLeaderboard = () => {
    // Create array with teams and random points
    const leaderboardData = teams.map(team => ({
      teamName: team,
      points: generateRandomPoints()
    }));
    
    // Sort by points in descending order
    return leaderboardData.sort((a, b) => b.points - a.points);
  };

  // Group matches by month
  const groupMatchesByMonth = (matches) => {
    const grouped = {};
    
    matches.forEach(match => {
      const dateParts = match.date.split('-');
      const monthNames = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
      };
      
      const monthKey = monthNames[dateParts[1]];
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      
      grouped[monthKey].push(match);
    });
    
    return grouped;
  };

  if (!scheduleJson || !scheduleJson.matches) {
    return <div className="error-message">No schedule data available</div>;
  }

  const groupedMatches = groupMatchesByMonth(scheduleJson.matches);

  return (
    <div className="schedule-container">
      <div className="schedule-list">
        {Object.entries(groupedMatches).map(([month, matches]) => (
          <div className="month-section" key={month}>
            <h2 className="month-title">{month}</h2>
            {matches.map((match) => (
              <div className="match-card" key={match.matchNo}>
                <div className="match-header" onClick={() => toggleMatch(match.matchNo)}>
                  <div className="match-info">
                    <div className="match-number">Match {match.matchNo}</div>
                    <div className="match-teams">{match.homeTeam} vs {match.awayTeam}</div>
                    <div className="match-details">
                      <div className="match-date">{match.date}</div>
                      <div className="match-venue">{match.venue}</div>
                      <div className="match-time">{match.time}</div>
                    </div>
                  </div>
                  <button className="expand-button">
                    {expandedMatch === match.matchNo ? 'Hide Leaderboard' : 'Show Leaderboard'}
                  </button>
                </div>
                
                {expandedMatch === match.matchNo && (
                  <div className="leaderboard-container">
                    <h3 className="leaderboard-title">Fantasy Points</h3>
                    <table className="leaderboard-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Team</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateLeaderboard().map((team, index) => (
                          <tr key={team.teamName} className={index < 3 ? 'top-team' : ''}>
                            <td>{index + 1}</td>
                            <td>{team.teamName}</td>
                            <td>{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDisplay; 