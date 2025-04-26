import React, { useState } from 'react';
import scheduleJson from './ipl-schedule-json.json';
import standingsData from './game-standings.json';

const Schedule = () => {
  const [expandedMatch, setExpandedMatch] = useState(null);
  
  // Toggle match expansion
  const toggleMatch = (matchNo) => {
    if (expandedMatch === matchNo) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchNo);
    }
  };
  
  // Get standings for a specific match
  const getStandingsForMatch = (matchNo) => {
    if (!standingsData || !standingsData.standings || !Array.isArray(standingsData.standings)) {
      return null;
    }
    
    const matchStanding = standingsData.standings.find(
      standing => standing && standing.matchNo === matchNo
    );
    
    if (!matchStanding || !matchStanding.teams || !Array.isArray(matchStanding.teams) || matchStanding.teams.length === 0) {
      return null;
    }
    
    return matchStanding.teams;
  };

  // Check if data exists for a match
  const hasMatchData = (matchNo) => {
    return getStandingsForMatch(matchNo) !== null;
  };

  // Get medal for rank
  const getMedalForRank = (rank) => {
    switch(rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  // Calculate money earned/lost based on rank
  const getMoneyForRank = (rank) => {
    switch(rank) {
      case 1: return 50;
      case 2: return 20;
      case 3: return 5;
      case 4: return 0;
      case 5: return -5;
      case 6: return -10;
      case 7: return -15;
      case 8: return -20;
      case 9: return -25;
      default: return 0;
    }
  };

  // Format money value with + or - sign
  const formatMoney = (value) => {
    if (value > 0) return `+₹${value}`;
    if (value < 0) return `-₹${Math.abs(value)}`;
    return `₹${value}`;
  };

  // Get CSS class for team row based on rank
  const getTeamRowClass = (rank) => {
    if (rank <= 3) return 'top-team';
    if (rank === 4) return 'fourth-team';
    return 'bottom-team';
  };

  // Group matches by month
  const groupMatchesByMonth = (matches) => {
    const grouped = {};
    
    matches.forEach(match => {
      // Check if date is valid
      if (!match.date || typeof match.date !== 'string') {
        return; // Skip this match if date is invalid
      }

      const dateParts = match.date.split('-');
      // Ensure we have valid date parts
      if (dateParts.length !== 3) {
        return; // Skip this match if date format is invalid
      }

      // Format is DD-MMM-YY, so month is the middle part (index 1)
      const monthAbbr = dateParts[1]; // This will be "Mar", "Apr", etc.
      
      // Map month abbreviations to full month names
      const monthMap = {
        'Jan': 'January',
        'Feb': 'February',
        'Mar': 'March',
        'Apr': 'April',
        'May': 'May',
        'Jun': 'June',
        'Jul': 'July',
        'Aug': 'August',
        'Sep': 'September',
        'Oct': 'October',
        'Nov': 'November',
        'Dec': 'December'
      };
      
      // Get the full month name or use the abbreviation if not found
      const monthName = monthMap[monthAbbr] || monthAbbr;
      
      if (!grouped[monthName]) {
        grouped[monthName] = [];
      }
      
      grouped[monthName].push(match);
    });
    
    return grouped;
  };

  if (!scheduleJson || !scheduleJson.matches) {
    return <div className="error-message">No schedule data available</div>;
  }

  const groupedMatches = groupMatchesByMonth(scheduleJson.matches);

  // Don't render if there are no matches
  if (Object.keys(groupedMatches).length === 0) {
    return <div className="error-message">No matches available to display</div>;
  }

  return (
    <div className="schedule-container">
      <div className="schedule-list">
        {Object.entries(groupedMatches).map(([month, matches]) => (
          // Only render month section if month is not undefined and has matches
          month && matches && matches.length > 0 ? (
            <div className="month-section" key={month}>
              <h2 className="month-title">{month}</h2>
              {matches.map((match) => (
                <div 
                  className={`match-card ${hasMatchData(match.matchNo) ? 'has-data' : ''}`} 
                  key={match.matchNo}
                >
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
                      <h3 className="leaderboard-title">Fantasy Points & Earnings</h3>
                      {getStandingsForMatch(match.matchNo) ? (
                        <table className="leaderboard-table">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Team</th>
                              <th>Points</th>
                              <th>Earnings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getStandingsForMatch(match.matchNo).map((team, index) => (
                              team && team.teamName ? (
                                <tr key={`${team.teamName}-${index}`} className={getTeamRowClass(team.rank)}>
                                  <td className="rank-cell">{getMedalForRank(team.rank)}</td>
                                  <td>{team.teamName}</td>
                                  <td>{team.points}</td>
                                  <td className={getMoneyForRank(team.rank) > 0 ? 'money-gain' : getMoneyForRank(team.rank) < 0 ? 'money-loss' : ''}>
                                    {formatMoney(getMoneyForRank(team.rank))}
                                  </td>
                                </tr>
                              ) : null
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="no-data-message">Match data not available</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default Schedule; 