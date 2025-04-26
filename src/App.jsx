import React, { useState } from 'react';
import './App.css';
import Schedule from './components/Schedule';
import Standings from './components/Standings';
import LeaderboardSubmission from './components/LeaderboardSubmission';

function App() {
  const [activeTab, setActiveTab] = useState('schedule'); // Default to schedule tab

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>IPL 2025 Fantasy League</h1>
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => handleTabChange('schedule')}
          >
            Schedule
          </button>
          <button 
            className={`tab-button ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => handleTabChange('standings')}
          >
            Standings
          </button>
          <button 
            className={`tab-button ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => handleTabChange('submit')}
          >
            Submit Data
          </button>
        </div>
      </header>
      <main>
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'standings' && <Standings />}
        {activeTab === 'submit' && <LeaderboardSubmission />}
      </main>
    </div>
  );
}

export default App; 