// imports
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5001/api";

function Stats({ refresh }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch stats from backend
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setLoading(false);
  };

  // fetch stats when component loads
  useEffect(() => {
    fetchStats();
  }, []);

  // fetch stats when refresh prop changes
  useEffect(() => {
    if (refresh) {
      fetchStats();
    }
  }, [refresh]);

  if (loading) {
    return <div className="stats-container">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="stats-container">No stats available</div>;
  }

  return (
    <div className="stats-container">
      <h2>Your Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Games</h3>
          <p className="stat-value">{stats.totalGames}</p>
        </div>

        <div className="stat-card">
          <h3>Games Won</h3>
          <p className="stat-value">{stats.gamesWon}</p>
        </div>

        <div className="stat-card">
          <h3>Win Rate</h3>
          <p className="stat-value">{stats.winRate}%</p>
        </div>

        <div className="stat-card">
          <h3>Average Guesses</h3>
          <p className="stat-value">{stats.averageGuesses}</p>
        </div>

        <div className="stat-card">
          <h3>Best Score</h3>
          <p className="stat-value">
            {stats.bestScore ? `${stats.bestScore} guesses` : "N/A"}
          </p>
        </div>
      </div>

      {stats.recentGames && stats.recentGames.length > 0 && (
        <div className="recent-games">
          <h3>Recent Games</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Guesses</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentGames.map((game) => (
                <tr key={game.id}>
                  <td>{new Date(game.timestamp).toLocaleDateString()}</td>
                  <td>{game.guesses_count}</td>
                  <td>{game.won ? "Won" : "Lost"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Stats;
