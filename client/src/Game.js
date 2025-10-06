// imports
import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5001/api";

// gameId - stores the current game's ID (null when no game active)
// guess - stores what the user types in the input
// feedback - message to show user (hints, win message, etc.)
// guessCount - how many guesses so far
// gameOver - true when game is won
// loading - shows loading state during API calls

function Game({ onGameEnd }) {
  const [gameId, setGameId] = useState(null);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);

  // start a new game
  const startGame = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/game/start`);
      setGameId(response.data.gameId);
      setFeedback(response.data.message);
      setGuess("");
      setGuessCount(0);
      setGameOver(false);
    } catch (error) {
      setFeedback("Error starting game. Make sure the server is running!");
      console.error("Error:", error);
    }
    setLoading(false);
  };

  // submit a guess
  const submitGuess = async (e) => {
    e.preventDefault();

    if (!guess || guess < 1 || guess > 100) {
      setFeedback("Please enter a number between 1 and 100");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/game/guess`, {
        gameId,
        guess: parseInt(guess),
      });

      setGuessCount(response.data.guessCount);

      if (response.data.gameOver) {
        setFeedback(`Correct! The number was ${response.data.targetNumber}!`);
        setGameOver(true);
        onGameEnd(); // Notify parent to refresh stats
      } else if (response.data.feedback === "higher") {
        setFeedback("Too low! Try a higher number.");
      } else {
        setFeedback("Too high! Try a lower number.");
      }

      setGuess("");
    } catch (error) {
      setFeedback("Error submitting guess");
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="game-container">
      <h2>Number Guessing Game</h2>

      {!gameId ? (
        <div>
          <p>I'm thinking of a number between 1 and 100.</p>
          <p>Can you guess it?</p>
          <button onClick={startGame} disabled={loading}>
            {loading ? "Starting..." : "Start New Game"}
          </button>
        </div>
      ) : (
        <div>
          <p className="feedback">{feedback}</p>
          <p className="guess-count">Guesses: {guessCount}</p>

          {!gameOver ? (
            <form onSubmit={submitGuess}>
              <input
                type="number"
                min="1"
                max="100"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess"
                disabled={loading}
                autoFocus
              />
              <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Guess"}
              </button>
            </form>
          ) : (
            <button onClick={startGame}>Play Again</button>
          )}
        </div>
      )}
    </div>
  );
}

export default Game;
