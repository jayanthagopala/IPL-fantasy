import React, { useState } from 'react';
import './App.css';
import Standings from './components/Standings';
import Schedule from './components/Schedule';
import MatchPoints from './components/MatchPoints';
import Admin from './components/Admin';

function App() {
  const [activeTab, setActiveTab] = useState('standings');

  return (
    <div className="App">
      <header className="App-header">
        <h1>IPL Fantasy 2025</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            Fantasy Standings
          </button>
          <button 
            className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
          <button 
            className={`tab ${activeTab === 'matchPoints' ? 'active' : ''}`}
            onClick={() => setActiveTab('matchPoints')}
          >
            Match Points
          </button>
          <button 
            className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Justin's Page
          </button>
        </div>
      </header>
      <main className="content">
        {activeTab === 'standings' ? <Standings /> : 
         activeTab === 'schedule' ? <Schedule /> : 
         activeTab === 'matchPoints' ? <MatchPoints /> : <Admin />}
      </main>
    </div>
  );
}

export default App; 