import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchJsonFromS3, saveLeaderboardData } from '../services/S3Service';

const LeaderboardSubmission = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [matchesData, setMatchesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMatchData, setIsFetchingMatchData] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingStandings, setExistingStandings] = useState([]);
  const [existingMatchData, setExistingMatchData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch match schedule and standings data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch match schedule from the local S3 data file
        const scheduleData = await fetchJsonFromS3('ipl-schedule-json.json');
        if (scheduleData && scheduleData.matches) {
          // Transform the data to match the expected format
          const formattedMatches = scheduleData.matches.map(match => ({
            id: `match${match.matchNo}`,
            team1: match.homeTeam,
            team2: match.awayTeam,
            date: match.date,
            venue: match.venue
          }));
          setMatchesData(formattedMatches);
        }

        // Fetch standings data
        const standingsData = await fetchJsonFromS3('game-standings.json');
        if (standingsData) {
          setExistingStandings(standingsData);
        }
      } catch (error) {
        setErrorMessage(`Error fetching data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if data exists for the selected match
  useEffect(() => {
    const checkExistingMatchData = async () => {
      if (!selectedMatch) return;
      
      setIsFetchingMatchData(true);
      setExistingMatchData(null);
      
      try {
        // Get the match number from the selectedMatch value (e.g., 'match1' -> 1)
        const matchNumber = parseInt(selectedMatch.replace('match', ''));
        
        // Check if there's existing data in the standings for this match
        if (existingStandings && existingStandings.standings) {
          const matchData = existingStandings.standings.find(
            match => match && match.matchNo === matchNumber
          );
          
          if (matchData) {
            // Format the existing data for the form
            const formattedMatchData = {
              match: {
                id: selectedMatch,
                team1: matchData.match_info?.team_1 || '',
                team2: matchData.match_info?.team_2 || '',
                result: matchData.match_info?.result || '',
                team1_score: matchData.match_info?.team_1_score || '',
                team2_score: matchData.match_info?.team_2_score || ''
              },
              standings: matchData.teams.map(team => ({
                teamName: team.teamName,
                points: team.points,
                rank: team.rank,
                note: team.note || ''
              }))
            };
            
            setExistingMatchData(formattedMatchData);
            setJsonInput(JSON.stringify(formattedMatchData, null, 2));
            setValidationResult({ isValid: true, data: formattedMatchData });
          } else {
            // Create a template if no existing data
            const template = createMatchTemplate(selectedMatch);
            setJsonInput(JSON.stringify(template, null, 2));
            setValidationResult(null);
          }
        } else {
          // Create a template if no standings data exists
          const template = createMatchTemplate(selectedMatch);
          setJsonInput(JSON.stringify(template, null, 2));
          setValidationResult(null);
        }
      } catch (error) {
        // Create a template if there was an error
        const template = createMatchTemplate(selectedMatch);
        setJsonInput(JSON.stringify(template, null, 2));
        setValidationResult(null);
        setErrorMessage(`Error checking match data: ${error.message}`);
      } finally {
        setIsFetchingMatchData(false);
      }
    };

    checkExistingMatchData();
  }, [selectedMatch, existingStandings]);

  const createMatchTemplate = (matchId) => {
    const matchNumber = parseInt(matchId.replace('match', ''));
    const matchInfo = matchesData.find(match => match.id === matchId);
    return {
      match: {
        id: matchId,
        matchNo: matchNumber,
        team1: matchInfo?.team1 || '',
        team2: matchInfo?.team2 || '',
        date: matchInfo?.date || '',
        venue: matchInfo?.venue || '',
        team1_score: '',
        team2_score: '',
        result: ''
      },
      standings: []
    };
  };

  const handleJsonInputChange = (e) => {
    setJsonInput(e.target.value);
    setValidationResult(null);
    setSubmitSuccess(false);
    setErrorMessage('');
  };

  const handleMatchSelectChange = (e) => {
    setSelectedMatch(e.target.value);
    setValidationResult(null);
    setSubmitSuccess(false);
    setErrorMessage('');
  };

  const validateJson = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      
      // Add your validation logic here
      // Example: Check if required fields exist
      if (!parsedData.match || !parsedData.standings) {
        setValidationResult({
          isValid: false,
          message: 'JSON must contain "match" and "standings" properties'
        });
        return;
      }

      setValidationResult({
        isValid: true,
        data: parsedData
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: `Invalid JSON: ${error.message}`
      });
    }
  };

  const handleSubmit = async () => {
    if (!validationResult || !validationResult.isValid) {
      setErrorMessage('Please validate your JSON before submitting');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      // Get the match number from the data
      const matchData = validationResult.data;
      const matchNo = parseInt(matchData.match.id.replace('match', ''));
      
      // Format the data for saving to S3
      const dataToSave = {
        match_info: {
          team_1: matchData.match.team1,
          team_2: matchData.match.team2,
          team_1_score: matchData.match.team1_score,
          team_2_score: matchData.match.team2_score,
          result: matchData.match.result
        },
        leaderboard: matchData.standings.map(team => ({
          team_name: team.teamName,
          points: team.points,
          rank: team.rank,
          note: team.note
        }))
      };
      
      // Save the data using S3Service
      const success = await saveLeaderboardData(matchNo, dataToSave);
      
      if (success) {
        setSubmitSuccess(true);
        // Refresh standings data
        const updatedStandings = await fetchJsonFromS3('game-standings.json');
        setExistingStandings(updatedStandings);
      } else {
        throw new Error('Failed to save match data');
      }
    } catch (error) {
      setErrorMessage(`Error submitting data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="leaderboard-submission-container">
      <h2>Update Leaderboard</h2>

      <div className="form-group">
        <label htmlFor="match-select">Select Match:</label>
        <select
          id="match-select"
          className="match-select"
          value={selectedMatch}
          onChange={handleMatchSelectChange}
          disabled={isLoading}
        >
          <option value="">-- Select a match --</option>
          {matchesData.map(match => (
            <option key={match.id} value={match.id}>
              {match.team1} vs {match.team2} ({match.date})
            </option>
          ))}
        </select>
        {isLoading && <div className="loading-inline">Loading matches...</div>}
      </div>

      {selectedMatch && isFetchingMatchData && (
        <div className="loading-inline">Checking for existing data...</div>
      )}

      {selectedMatch && existingMatchData && !isFetchingMatchData && (
        <div className="existing-data-notice">
          Existing data found for this match. You can edit it below.
        </div>
      )}

      <div className="form-group">
        <label htmlFor="json-input">Match Data (JSON):</label>
        <textarea
          id="json-input"
          className="json-input"
          value={jsonInput}
          onChange={handleJsonInputChange}
          disabled={isLoading || !selectedMatch}
          placeholder={selectedMatch ? "Loading..." : "Select a match first"}
        />
      </div>

      <div className="action-buttons">
        <button
          className="validate-button"
          onClick={validateJson}
          disabled={isLoading || !jsonInput || !selectedMatch}
        >
          Validate JSON
        </button>
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={isLoading || !validationResult || !validationResult.isValid}
        >
          {isLoading ? 'Submitting...' : 'Submit Data'}
        </button>
      </div>

      {validationResult && !validationResult.isValid && (
        <div className="error-message">
          {validationResult.message}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      {submitSuccess && (
        <div className="success-message">
          Data successfully submitted and standings updated!
        </div>
      )}

      {validationResult && validationResult.isValid && (
        <div className="data-preview">
          <h3>Validated Data Preview</h3>
          
          <h4>Match Information</h4>
          <div className="match-info-preview">
            <p><strong>ID:</strong> {validationResult.data.match.id}</p>
            <p><strong>Teams:</strong> {validationResult.data.match.team1} vs {validationResult.data.match.team2}</p>
            <p><strong>Date:</strong> {validationResult.data.match.date}</p>
            <p><strong>Venue:</strong> {validationResult.data.match.venue}</p>
          </div>
          
          <h4>Standings Update Preview</h4>
          <p>This will update standings for {validationResult.data.standings.length} teams.</p>
        </div>
      )}

      <div className="help-section">
        <h4>Format Help</h4>
        <p>The JSON should include match details and updated standings:</p>
        <ul>
          <li>Match ID must match the selected match</li>
          <li>Include team names, date, and venue information</li>
          <li>Standings should include team name, points, and other statistics</li>
        </ul>
      </div>
    </div>
  );
};

export default LeaderboardSubmission; 