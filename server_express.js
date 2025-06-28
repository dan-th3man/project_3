const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// MongoDB connection
const uri = 'mongodb+srv://dan_th3_man:masterchief11@cluster0.xewil2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
let db;

async function connectToDB() {
  if (!db) {
    await client.connect();
    db = client.db('quizApp');
  }
  return db;
}

// Signup
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;
  const db = await connectToDB();
  const users = db.collection('users');

  const existing = await users.findOne({ username });
  if (existing) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }

  await users.insertOne({ username: username.trim(), password: password.trim(), email: email.trim() });
  res.json({ success: true, username });
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await connectToDB();
  const user = await db.collection('users').findOne({ username, password });

  if (user) {
    res.json({ success: true, username: user.username, email: user.email || `${user.username}@example.com` });
  } else {
    res.status(401).json({ success: false });
  }
});


// Submit quiz
app.post('/submit-quiz', async (req, res) => {
  const quizData = req.body;
  const db = await connectToDB();
  await db.collection('results').insertOne(quizData);
  res.json({ message: 'Quiz submitted successfully!' });
});

// Leaderboard with global user rank
app.get('/leaderboard/:username', async (req, res) => {
  const db = await connectToDB();
  const allScores = await db.collection('results')
    .find({})
    .sort({ score: -1 })
    .toArray();

  const top10 = allScores.slice(0, 10);
  const { username } = req.params;

  // Get user's highest score
  const userEntries = allScores.filter(entry => entry.username === username);
  const highestScore = Math.max(...userEntries.map(e => e.score), 0);

  // Get user's rank
  const rank = allScores.findIndex(entry =>
    entry.username === username && entry.score === highestScore
  ) + 1;

  res.json({ top10, rank });
});

// Get all scores for a specific user
app.get('/user-scores/:username', async (req, res) => {
  const db = await connectToDB();
  const userScores = await db.collection('results')
    .find({ username: req.params.username })
    .toArray();
  res.json(userScores);
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>');
});

// Start server
app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
