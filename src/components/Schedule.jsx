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
                      {getStandingsForMatch(match.matchNo) ? (
                        <table className="leaderboard-table">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Team</th>
                              <th>Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getStandingsForMatch(match.matchNo).map((team, index) => (
                              team && team.teamName ? (
                                <tr key={`${team.teamName}-${index}`} className={team.rank <= 3 ? 'top-team' : ''}>
                                  <td>{team.rank}</td>
                                  <td>{team.teamName}</td>
                                  <td>{team.points}</td>
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