import React from 'react';

function Standings() {
  return (
    <div className="standings">
      <h2>Fantasy Standings</h2>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Sibi</td>
            <td>85</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jayanth</td>
            <td>40</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Ram</td>
            <td>10</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Anantha</td>
            <td>25</td>
          </tr>
          <tr>
            <td>5</td>
            <td>Sampath</td>
            <td>-5</td>
          </tr>
          <tr>
            <td>6</td>
            <td>Jaya</td>
            <td>-15</td>
          </tr>
          <tr>
            <td>7</td>
            <td>Justin</td>
            <td>-20</td>
          </tr>
          <tr>
            <td>8</td>
            <td>Vicky</td>
            <td>-65</td>
          </tr>
          <tr>
            <td>9</td>
            <td>Sundar</td>
            <td>-55</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Standings; 