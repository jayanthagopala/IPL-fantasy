import React from 'react';
import './App.css';
import Schedule from './components/Schedule';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>IPL 2025 Schedule</h1>
      </header>
      <main>
        <Schedule />
      </main>
    </div>
  );
}

export default App; 