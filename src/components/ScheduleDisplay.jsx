import React from 'react';
import scheduleJson from './ipl-schedule-json.json';

const ScheduleDisplay = () => {
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
                <div className="match-number">Match {match.matchNo}</div>
                <div className="match-teams">{match.homeTeam} vs {match.awayTeam}</div>
                <div className="match-details">
                  <div className="match-date">{match.date}</div>
                  <div className="match-venue">{match.venue}</div>
                  <div className="match-time">{match.time}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDisplay; 