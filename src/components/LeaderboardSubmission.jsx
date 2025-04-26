import React, { useState, useEffect } from 'react';
import { fetchJsonFromS3, saveLeaderboardData } from '../services/S3Service';

const LeaderboardSubmission = () => {
  const [selectedMatch, setSelectedMatch] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch match schedule from S3
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const scheduleData = await fetchJsonFromS3('ipl-schedule-json.json');
        if (scheduleData && scheduleData.matches) {
          setMatches(scheduleData.matches);
        }
      } catch (err) {
        console.error('Error fetching schedule data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchedule();
  }, []);
  
  // Load sample JSON when a match is selected
  useEffect(() => {
    if (selectedMatch) {
      const selectedMatchObj = matches.find(match => match.matchNo === parseInt(selectedMatch));
      if (selectedMatchObj) {
        const sampleJson = {
          match_info: {
            team_1: selectedMatchObj.homeTeam,
            team_2: selectedMatchObj.awayTeam,
            team_1_score: "",
            team_2_score: "",
            result: ""
          },
          leaderboard: [
            { rank: 1, team_name: "Anantha Team", points: 0 },
            { rank: 2, team_name: "JUSTIN CHALLENGERS", points: 0 },
            { rank: 3, team_name: "Sundar Night Fury", points: 0 },
            { rank: 4, team_name: "JAYAGAN ARMY", points: 0 },
            { rank: 5, team_name: "Vjvignesh94", points: 0 },
            { rank: 6, team_name: "Devilish 11", points: 0 },
            { rank: 7, team_name: "CheemsRajah", points: 0 },
            { rank: 8, team_name: "Jais Royal Challengers", points: 0 },
            { rank: 9, team_name: "Garuda Tejas", points: 0 }
          ]
        };
        setJsonInput(JSON.stringify(sampleJson, null, 2));
      }
    }
  }, [selectedMatch, matches]);
  
  // Handle JSON input changes
  const handleJsonChange = (e) => {
    setJsonInput(e.target.value);
    setParseError(null);
    setParsedData(null);
    setSubmitSuccess(false);
    setSubmitError(null);
  };
  
  // Parse and validate JSON
  const parseAndValidateJson = () => {
    setParseError(null);
    setParsedData(null);
    
    try {
      // Parse the input JSON
      const parsedJson = JSON.parse(jsonInput);
      
      // Validate required structure
      if (!parsedJson.match_info || !parsedJson.leaderboard) {
        setParseError("JSON must contain match_info and leaderboard properties");
        return;
      }
      
      // Validate match info
      const { match_info } = parsedJson;
      if (!match_info.team_1 || !match_info.team_2) {
        setParseError("Match info must contain team_1 and team_2");
        return;
      }
      
      // Validate leaderboard
      if (!Array.isArray(parsedJson.leaderboard) || parsedJson.leaderboard.length !== 9) {
        setParseError("Leaderboard must be an array with 9 entries");
        return;
      }
      
      // Check if leaderboard entries have required fields
      const missingFields = parsedJson.leaderboard.some(entry => 
        !entry.rank || !entry.team_name || entry.points === undefined
      );
      
      if (missingFields) {
        setParseError("Each leaderboard entry must have rank, team_name, and points");
        return;
      }
      
      // Check match number
      if (!selectedMatch) {
        setParseError("Please select a match number");
        return;
      }
      
      // Set the parsed data for preview
      setParsedData({
        ...parsedJson,
        matchNo: parseInt(selectedMatch) // Add match number for saving
      });
      
    } catch (error) {
      setParseError(`Invalid JSON: ${error.message}`);
    }
  };
  
  // Submit the parsed data to be saved
  const handleSubmit = async () => {
    if (!parsedData) {
      setSubmitError("Please validate the JSON first");
      return;
    }
    
    try {
      setIsSaving(true);
      setSubmitError(null);
      
      // Save the leaderboard data
      await saveLeaderboardData(parseInt(selectedMatch), parsedData);
      
      setSubmitSuccess(true);
      
      // Simulated delay to show success message
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error) {
      setSubmitError(`Error submitting data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="loading-message">Loading matches...</div>;
  }
  
  return (
    <div className="leaderboard-submission-container">
      <h2>Submit Leaderboard Data</h2>
      
      {/* Match Selection */}
      <div className="form-group">
        <label htmlFor="match-select">Select Match:</label>
        <select 
          id="match-select"
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          className="match-select"
        >
          <option value="">-- Select a Match --</option>
          {matches.map(match => (
            <option key={match.matchNo} value={match.matchNo}>
              Match {match.matchNo}: {match.homeTeam} vs {match.awayTeam} ({match.date})
            </option>
          ))}
        </select>
      </div>
      
      {/* JSON Input */}
      <div className="form-group">
        <label htmlFor="json-input">Leaderboard JSON:</label>
        <textarea
          id="json-input"
          className="json-input"
          value={jsonInput}
          onChange={handleJsonChange}
          rows={20}
          placeholder="Paste JSON here"
        />
      </div>
      
      {/* Validation Error */}
      {parseError && (
        <div className="error-message">
          {parseError}
        </div>
      )}
      
      {/* Submit Success */}
      {submitSuccess && (
        <div className="success-message">
          Leaderboard data for Match {selectedMatch} submitted successfully!
        </div>
      )}
      
      {/* Submit Error */}
      {submitError && (
        <div className="error-message">
          {submitError}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="validate-button"
          onClick={parseAndValidateJson}
          disabled={!jsonInput.trim() || !selectedMatch}
        >
          Validate JSON
        </button>
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={!parsedData || isSaving}
        >
          {isSaving ? 'Saving...' : 'Submit Leaderboard'}
        </button>
      </div>
      
      {/* Data Preview */}
      {parsedData && (
        <div className="data-preview">
          <h3>Data Preview for Match {selectedMatch}</h3>
          
          <div className="match-info-preview">
            <h4>Match Information</h4>
            <p><strong>{parsedData.match_info.team_1}</strong> {parsedData.match_info.team_1_score}</p>
            <p><strong>{parsedData.match_info.team_2}</strong> {parsedData.match_info.team_2_score}</p>
            <p><strong>Result:</strong> {parsedData.match_info.result}</p>
          </div>
          
          <div className="leaderboard-preview">
            <h4>Leaderboard</h4>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team</th>
                  <th>Points</th>
                  {parsedData.leaderboard.some(entry => entry.note) && <th>Note</th>}
                </tr>
              </thead>
              <tbody>
                {parsedData.leaderboard.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.rank}</td>
                    <td>{entry.team_name}</td>
                    <td>{entry.points}</td>
                    {parsedData.leaderboard.some(entry => entry.note) && <td>{entry.note || ''}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardSubmission; 