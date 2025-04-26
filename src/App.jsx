import React from 'react';
import './App.css';
import ScheduleDisplay from './components/ScheduleDisplay';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>IPL 2025 Schedule</h1>
      </header>
      <ScheduleDisplay />
    </div>
  );
}

export default App; 