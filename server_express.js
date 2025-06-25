    const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

let users = [];

app.use(express.json());

app.use(express.static(__dirname));

// Load users from users.json
function loadUsers() {
  if (fs.existsSync('users.json')) {
    const content = fs.readFileSync('users.json', 'utf-8').trim();
    if (content) {
      users = JSON.parse(content);
    }
  }
}

loadUsers();

//signup 
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  loadUsers();

  if (users.some(u => u.username === username)) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }

  users.push({ username, password });
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  loadUsers();

  res.json({ success: true, username });
});

// log in 
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  loadUsers();

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, username });
  } else {
    res.status(401).json({ success: false });
  }
});

// read in questions
app.get('/questions.json', (req, res) => {
  fs.readFile(path.join(__dirname, 'questions.json'), (err, data) => {
    if (err) {
      res.status(500).send('Error loading questions');
    } else {
      res.type('application/json').send(data);
    }
  });
});

// submit quiz
app.post('/submit-quiz', (req, res) => {
  const quizData = req.body;
  console.log('Quiz submission:', quizData);

  let results = [];
  const filePath = 'quiz-results.json';

  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    results = lines.map(line => JSON.parse(line));
  }

  results.push(quizData);
  fs.writeFileSync(filePath, results.map(r => JSON.stringify(r)).join('\n'));

  res.json({ message: 'Quiz submitted successfully!' });
});

// leaderbpard
app.get('/leaderboard', (req, res) => {
  let results = [];
  const filePath = 'quiz-results.json';

  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    results = lines.map(line => JSON.parse(line));
  }

  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, 10);

  res.json(top);
});

//error 404
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>');
});

// start the server
app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
