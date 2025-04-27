import React, { useState, useEffect } from 'react';
import { fetchJsonFromS3 } from '../services/S3Service';

const Schedule = () => {
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [scheduleJson, setScheduleJson] = useState(null);
  const [standingsData, setStandingsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch data from S3
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data from S3
        const scheduleData = await fetchJsonFromS3('ipl-schedule-json.json');
        const standings = await fetchJsonFromS3('game-standings.json');
        
        setScheduleJson(scheduleData);
        setStandingsData(standings);
      } catch (err) {
        console.error('Error fetching data from S3:', err);
        setError('Failed to load data from S3. Please try again later or check your network connection.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Toggle match expansion
  const toggleMatch = (matchNo) => {
    if (expandedMatch === matchNo) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchNo);
    }
  };
  
  // Get match data for a specific match
  const getMatchData = (matchNo) => {
    if (!standingsData || !standingsData.standings || !Array.isArray(standingsData.standings)) {
      return null;
    }
    
    return standingsData.standings.find(
      standing => standing && standing.matchNo === matchNo
    );
  };
  
  // Get standings for a specific match
  const getStandingsForMatch = (matchNo) => {
    const matchData = getMatchData(matchNo);
    
    if (!matchData || !matchData.teams || !Array.isArray(matchData.teams) || matchData.teams.length === 0) {
      return null;
    }
    
    return matchData.teams;
  };

  // Check if data exists for a match
  const hasMatchData = (matchNo) => {
    return getMatchData(matchNo) !== null;
  };
  
  // Check if standings data exists for a match (for highlighting)
  const hasStandingsData = (matchNo) => {
    const standings = getStandingsForMatch(matchNo);
    return standings !== null && standings.length > 0;
  };
  
  // Check if match info exists for a match
  const hasMatchInfo = (matchNo) => {
    const matchData = getMatchData(matchNo);
    return matchData && matchData.match_info && matchData.match_info.team_1 && matchData.match_info.team_2;
  };

  // Check if any team in a match has a note
  const hasNotes = (matchNo) => {
    const teams = getStandingsForMatch(matchNo);
    if (!teams || !Array.isArray(teams)) return false;
    
    return teams.some(team => team && team.note);
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
    if (!matches) return {};
    
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

  // Show loading state
  if (isLoading) {
    return <div className="loading-message">Loading schedule data from S3...</div>;
  }

  // Show error state
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Show error if schedule data is missing
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
                  className={`match-card ${hasStandingsData(match.matchNo) ? 'has-data' : ''}`} 
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
                      {expandedMatch === match.matchNo ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                  
                  {expandedMatch === match.matchNo && (
                    <div className="leaderboard-container">
                      {hasMatchInfo(match.matchNo) ? (
                        <div className="match-result-info">
                          <h4>Match Result</h4>
                          <div className="match-scores">
                            <p><strong>{getMatchData(match.matchNo)?.match_info?.team_1}</strong>: {getMatchData(match.matchNo)?.match_info?.team_1_score}</p>
                            <p><strong>{getMatchData(match.matchNo)?.match_info?.team_2}</strong>: {getMatchData(match.matchNo)?.match_info?.team_2_score}</p>
                            <p className="match-result">{getMatchData(match.matchNo)?.match_info?.result}</p>
                          </div>
                        </div>
                      ) : hasMatchData(match.matchNo) && (
                        <div className="no-match-info">
                          <p>Match results not available</p>
                        </div>
                      )}
                      
                      <h3 className="leaderboard-title">Fantasy Points & Earnings</h3>
                      {getStandingsForMatch(match.matchNo) ? (
                        <table className="leaderboard-table">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Team</th>
                              <th>Points</th>
                              <th>Earnings</th>
                              {hasNotes(match.matchNo) && (
                                <th>Note</th>
                              )}
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
                                  {hasNotes(match.matchNo) && (
                                    <td>{team.note || ''}</td>
                                  )}
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