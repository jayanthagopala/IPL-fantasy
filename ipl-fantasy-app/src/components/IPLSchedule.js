import React, { useState, useEffect } from 'react';

const IPLSchedule = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    // In a real app, we would fetch data from an API
    // For this demo, we'll use the data extracted from the PDF
    const scheduledMatches = [
      // First page of matches (1-37)
      { matchNo: 1, matchDay: 1, date: "22-Mar-25", day: "Sat", start: "7:30 PM", home: "Kolkata Knight Riders", away: "Royal Challengers Bengaluru", venue: "Kolkata" },
      { matchNo: 2, matchDay: 2, date: "23-Mar-25", day: "Sun", start: "3:30 PM", home: "Sunrisers Hyderabad", away: "Rajasthan Royals", venue: "Hyderabad" },
      { matchNo: 3, matchDay: 2, date: "23-Mar-25", day: "Sun", start: "7:30 PM", home: "Chennai Super Kings", away: "Mumbai Indians", venue: "Chennai" },
      { matchNo: 4, matchDay: 3, date: "24-Mar-25", day: "Mon", start: "7:30 PM", home: "Delhi Capitals", away: "Lucknow Super Giants", venue: "Visakhapatnam" },
      { matchNo: 5, matchDay: 4, date: "25-Mar-25", day: "Tue", start: "7:30 PM", home: "Gujarat Titans", away: "Punjab Kings", venue: "Ahmedabad" },
      { matchNo: 6, matchDay: 5, date: "26-Mar-25", day: "Wed", start: "7:30 PM", home: "Rajasthan Royals", away: "Kolkata Knight Riders", venue: "Guwahati" },
      { matchNo: 7, matchDay: 6, date: "27-Mar-25", day: "Thu", start: "7:30 PM", home: "Sunrisers Hyderabad", away: "Lucknow Super Giants", venue: "Hyderabad" },
      { matchNo: 8, matchDay: 7, date: "28-Mar-25", day: "Fri", start: "7:30 PM", home: "Chennai Super Kings", away: "Royal Challengers Bengaluru", venue: "Chennai" },
      { matchNo: 9, matchDay: 8, date: "29-Mar-25", day: "Sat", start: "7:30 PM", home: "Gujarat Titans", away: "Mumbai Indians", venue: "Ahmedabad" },
      { matchNo: 10, matchDay: 9, date: "30-Mar-25", day: "Sun", start: "3:30 PM", home: "Delhi Capitals", away: "Sunrisers Hyderabad", venue: "Visakhapatnam" },
      { matchNo: 11, matchDay: 9, date: "30-Mar-25", day: "Sun", start: "7:30 PM", home: "Rajasthan Royals", away: "Chennai Super Kings", venue: "Guwahati" },
      { matchNo: 12, matchDay: 10, date: "31-Mar-25", day: "Mon", start: "7:30 PM", home: "Mumbai Indians", away: "Kolkata Knight Riders", venue: "Mumbai" },
      { matchNo: 13, matchDay: 11, date: "01-Apr-25", day: "Tue", start: "7:30 PM", home: "Lucknow Super Giants", away: "Punjab Kings", venue: "Lucknow" },
      { matchNo: 14, matchDay: 12, date: "02-Apr-25", day: "Wed", start: "7:30 PM", home: "Royal Challengers Bengaluru", away: "Gujarat Titans", venue: "Bengaluru" },
      { matchNo: 15, matchDay: 13, date: "03-Apr-25", day: "Thu", start: "7:30 PM", home: "Kolkata Knight Riders", away: "Sunrisers Hyderabad", venue: "Kolkata" },
      { matchNo: 16, matchDay: 14, date: "04-Apr-25", day: "Fri", start: "7:30 PM", home: "Lucknow Super Giants", away: "Mumbai Indians", venue: "Lucknow" },
      { matchNo: 17, matchDay: 15, date: "05-Apr-25", day: "Sat", start: "3:30 PM", home: "Chennai Super Kings", away: "Delhi Capitals", venue: "Chennai" },
      { matchNo: 18, matchDay: 15, date: "05-Apr-25", day: "Sat", start: "7:30 PM", home: "Punjab Kings", away: "Rajasthan Royals", venue: "New Chandigarh" },
      { matchNo: 19, matchDay: 16, date: "06-Apr-25", day: "Sun", start: "3:30 PM", home: "Kolkata Knight Riders", away: "Lucknow Super Giants", venue: "Kolkata" },
      { matchNo: 20, matchDay: 16, date: "06-Apr-25", day: "Sun", start: "7:30 PM", home: "Sunrisers Hyderabad", away: "Gujarat Titans", venue: "Hyderabad" },
      
      // Adding more matches
      { matchNo: 21, matchDay: 17, date: "07-Apr-25", day: "Mon", start: "7:30 PM", home: "Mumbai Indians", away: "Royal Challengers Bengaluru", venue: "Mumbai" },
      { matchNo: 22, matchDay: 18, date: "08-Apr-25", day: "Tue", start: "7:30 PM", home: "Punjab Kings", away: "Chennai Super Kings", venue: "New Chandigarh" },
      { matchNo: 23, matchDay: 19, date: "09-Apr-25", day: "Wed", start: "7:30 PM", home: "Gujarat Titans", away: "Rajasthan Royals", venue: "Ahmedabad" },
      { matchNo: 24, matchDay: 20, date: "10-Apr-25", day: "Thu", start: "7:30 PM", home: "Royal Challengers Bengaluru", away: "Delhi Capitals", venue: "Bengaluru" },
      { matchNo: 25, matchDay: 21, date: "11-Apr-25", day: "Fri", start: "7:30 PM", home: "Chennai Super Kings", away: "Kolkata Knight Riders", venue: "Chennai" },
      { matchNo: 26, matchDay: 22, date: "12-Apr-25", day: "Sat", start: "3:30 PM", home: "Lucknow Super Giants", away: "Gujarat Titans", venue: "Lucknow" },
      { matchNo: 27, matchDay: 22, date: "12-Apr-25", day: "Sat", start: "7:30 PM", home: "Sunrisers Hyderabad", away: "Punjab Kings", venue: "Hyderabad" },
      { matchNo: 28, matchDay: 23, date: "13-Apr-25", day: "Sun", start: "3:30 PM", home: "Rajasthan Royals", away: "Royal Challengers Bengaluru", venue: "Jaipur" },
      { matchNo: 29, matchDay: 23, date: "13-Apr-25", day: "Sun", start: "7:30 PM", home: "Delhi Capitals", away: "Mumbai Indians", venue: "Delhi" },
      { matchNo: 30, matchDay: 24, date: "14-Apr-25", day: "Mon", start: "7:30 PM", home: "Lucknow Super Giants", away: "Chennai Super Kings", venue: "Lucknow" },
      
      // Playoffs
      { matchNo: 71, matchDay: 60, date: "20-May-25", day: "Tue", start: "7:30 PM", home: "TBD", away: "TBD", venue: "Hyderabad", type: "Qualifier 1" },
      { matchNo: 72, matchDay: 61, date: "21-May-25", day: "Wed", start: "7:30 PM", home: "TBD", away: "TBD", venue: "Hyderabad", type: "Eliminator" },
      { matchNo: 73, matchDay: 63, date: "23-May-25", day: "Fri", start: "7:30 PM", home: "TBD", away: "TBD", venue: "Kolkata", type: "Qualifier 2" },
      { matchNo: 74, matchDay: 65, date: "25-May-25", day: "Sun", start: "7:30 PM", home: "TBD", away: "TBD", venue: "Kolkata", type: "Final" }
    ];
    
    setMatches(scheduledMatches);
    setLoading(false);
  }, []);

  // Get the list of all teams
  const teams = [...new Set([
    ...matches.map(match => match.home),
    ...matches.map(match => match.away)
  ])].filter(team => team !== 'TBD').sort();

  // Get list of all venues
  const venues = [...new Set(matches.map(match => match.venue))].sort();

  // Filter matches based on selected team or venue
  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    if (filter === 'team' && selectedTeam !== 'all') {
      return match.home === selectedTeam || match.away === selectedTeam;
    }
    if (filter === 'venue' && selectedTeam !== 'all') {
      return match.venue === selectedTeam;
    }
    return true;
  });

  // Team color mapping for visual distinction
  const teamColors = {
    "Kolkata Knight Riders": "bg-purple-100",
    "Royal Challengers Bengaluru": "bg-red-100",
    "Sunrisers Hyderabad": "bg-orange-100",
    "Rajasthan Royals": "bg-blue-100",
    "Chennai Super Kings": "bg-yellow-100",
    "Mumbai Indians": "bg-blue-100",
    "Delhi Capitals": "bg-sky-100",
    "Lucknow Super Giants": "bg-teal-100",
    "Gujarat Titans": "bg-gray-100",
    "Punjab Kings": "bg-red-100",
    "TBD": "bg-gray-100"
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-800 text-white py-4 px-6">
          <h2 className="text-center text-2xl font-bold">IPL 2025 Season Schedule</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex items-center gap-2">
              <label className="font-medium">Filter by:</label>
              <select 
                className="p-2 border rounded-md"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setSelectedTeam('all');
                }}
              >
                <option value="all">All Matches</option>
                <option value="team">Team</option>
                <option value="venue">Venue</option>
              </select>
            </div>
            
            {filter !== 'all' && (
              <div className="flex items-center gap-2">
                <label className="font-medium">Select {filter}:</label>
                <select 
                  className="p-2 border rounded-md"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="all">All {filter === 'team' ? 'Teams' : 'Venues'}</option>
                  {filter === 'team' 
                    ? teams.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))
                    : venues.map(venue => (
                        <option key={venue} value={venue}>{venue}</option>
                      ))
                  }
                </select>
              </div>
            )}
            
            <div className="ml-auto text-sm text-gray-500">
              Showing {filteredMatches.length} of {matches.length} matches
            </div>
          </div>

          {loading ? (
            <div className="text-center p-8">Loading schedule...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border">Match #</th>
                    <th className="py-2 px-4 border">Date</th>
                    <th className="py-2 px-4 border">Day</th>
                    <th className="py-2 px-4 border">Time</th>
                    <th className="py-2 px-4 border">Home Team</th>
                    <th className="py-2 px-4 border">Away Team</th>
                    <th className="py-2 px-4 border">Venue</th>
                    <th className="py-2 px-4 border">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => (
                    <tr key={match.matchNo} className={match.type ? "font-bold" : ""}>
                      <td className="py-2 px-4 border text-center">{match.matchNo}</td>
                      <td className="py-2 px-4 border text-center">{match.date}</td>
                      <td className="py-2 px-4 border text-center">{match.day}</td>
                      <td className="py-2 px-4 border text-center">{match.start}</td>
                      <td className={`py-2 px-4 border ${teamColors[match.home] || ""}`}>
                        {match.home}
                      </td>
                      <td className={`py-2 px-4 border ${teamColors[match.away] || ""}`}>
                        {match.away}
                      </td>
                      <td className="py-2 px-4 border text-center">{match.venue}</td>
                      <td className="py-2 px-4 border text-center">
                        {match.type || "League Match"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-4 text-center text-sm text-gray-500">
            Please note that this schedule may be subject to change for any reason as may be required in the sole discretion of BCCI
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPLSchedule;