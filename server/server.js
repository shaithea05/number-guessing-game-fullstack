// imports
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5001;

// middleware
app.use(cors());
app.use(bodyParser.json());

// initializes SQLite database
const db = new sqlite3.Database("./games.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");

    // creates games table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_number INTEGER NOT NULL,
        guesses_count INTEGER NOT NULL,
        won BOOLEAN NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// stores active games (in memory for now)
const activeGames = {};

// API routes

// starts a new game
app.post("/api/game/start", (req, res) => {
  const gameId = Date.now().toString();
  const targetNumber = Math.floor(Math.random() * 100) + 1;

  activeGames[gameId] = {
    targetNumber,
    guesses: [],
  };

  res.json({
    gameId,
    message: "Game started! Guess a number between 1 and 100",
  });
});

// submit a guess
app.post("/api/game/guess", (req, res) => {
  const { gameId, guess } = req.body;

  if (!activeGames[gameId]) {
    return res.status(404).json({ error: "Game not found" });
  }

  const game = activeGames[gameId];
  const guessNum = parseInt(guess);

  if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
    return res
      .status(400)
      .json({ error: "Please enter a number between 1 and 100" });
  }

  game.guesses.push(guessNum);

  let feedback;
  let gameOver = false;

  if (guessNum === game.targetNumber) {
    feedback = "correct";
    gameOver = true;

    // saves to database
    db.run(
      "INSERT INTO games (target_number, guesses_count, won) VALUES (?, ?, ?)",
      [game.targetNumber, game.guesses.length, true],
      (err) => {
        if (err) console.error("Error saving game:", err);
      }
    );

    delete activeGames[gameId];
  } else if (guessNum < game.targetNumber) {
    feedback = "higher";
  } else {
    feedback = "lower";
  }

  res.json({
    feedback,
    gameOver,
    guessCount: game.guesses.length,
    targetNumber: gameOver ? game.targetNumber : null,
  });
});

// gets stats
app.get("/api/stats", (req, res) => {
  db.all("SELECT * FROM games ORDER BY timestamp DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching stats" });
    }

    const totalGames = rows.length;
    const gamesWon = rows.filter((g) => g.won).length;
    const averageGuesses =
      totalGames > 0
        ? rows.reduce((sum, g) => sum + g.guesses_count, 0) / totalGames
        : 0;
    const bestScore =
      totalGames > 0 ? Math.min(...rows.map((g) => g.guesses_count)) : null;

    res.json({
      totalGames,
      gamesWon,
      winRate: totalGames > 0 ? ((gamesWon / totalGames) * 100).toFixed(1) : 0,
      averageGuesses: averageGuesses.toFixed(1),
      bestScore,
      recentGames: rows.slice(0, 10),
    });
  });
});

// starts server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
