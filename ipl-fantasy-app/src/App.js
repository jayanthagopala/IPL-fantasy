import React from 'react';
import './App.css';
import IPLSchedule from './components/IPLSchedule';

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{ height: 'auto', minHeight: '150px', padding: '20px' }}>
        <h1>IPL 2025 Schedule Viewer</h1>
        <p>
          Browse the complete 2025 Indian Premier League cricket tournament schedule
        </p>
      </header>
      <main className="App-content">
        <IPLSchedule />
      </main>
      <footer className="App-footer" style={{ padding: '20px', marginTop: '30px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
        <p>Data from IPLT20.COM - Unofficial schedule viewer</p>
      </footer>
    </div>
  );
}

export default App;