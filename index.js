const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Create a new SQLite database or connect to an existing one
const db = new sqlite3.Database('./db.sqlite');

// Create a table for users (if not exists)
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )
`);

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const data = {
    pageTitle: 'Login Page',
    message: 'Login Page',
    errormessage: '',
  };
  res.render('index', data);
});


// Assuming you have an array of questions stored in `questions`
const questions = [
  'Question 1: What is ...?',
  'Question 2: Who was ...?',
  'Question 3: What is ...?',
  'Question 4: Who was ...?',
  // Add all your questions here
];

const correctAnswers = ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4']; // Add correct answers in corresponding order


let currentQuestionIndex = 0;
var rowIndex = 0;


app.get('/quiz', (req, res) => {
  const username = req.query.username;

  db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (row) {
      const id = row.id;

      db.get('SELECT questionIndex FROM user_answers WHERE id = ?', [parseInt(id)], (err, row) => {
        if (err) {
          return console.error(err.message);
        }

        if (row) {
          const currentQuestionIndex = parseInt(row.questionIndex);

          const questionData = {
            pageTitle: 'Quiz',
            question: questions[currentQuestionIndex],
            questionNumber: currentQuestionIndex + 1,
            username: username,
          };

          res.render('quiz', questionData);

          const newQuestionIndex = currentQuestionIndex + 1;

          const query = `
            UPDATE user_answers
            SET questionIndex = ?
            WHERE id = ?;
          `;

          db.run(query, [newQuestionIndex, parseInt(id)], function(err) {
            if (err) {
              return console.error(err.message);
            }

            console.log(`Row(s) updated: ${this.changes}. SQL Syntax ${newQuestionIndex} ${id}`);
          });
        }
      });
    }
  });
});


app.post('/quiz', (req, res) => {
  const userAnswer = req.body.answer; // Assuming 'answer' is the name attribute of your radio buttons
  // Do something with the user's answer (e.g., compare with the correct answer)
   // Compare user's answer with the correct answer
   if (userAnswer === correctAnswers[currentQuestionIndex - 1]) {
    // Handle correct answer
    // You can keep track of the user's score here
    console.log("You re right");
  } else{
    console.log("You re wrong");
  }


  // Render the next question
  res.redirect(`/quiz?username=${req.body.username}`);
});

app.get('/welcome/:username', (req, res) => {
  const username = req.params.username;
 
  const data = {
    pageTitle: 'Welcome Page',
    message: `Welcome, ${username}!`,
    username: username,
  };
  res.render('welcome', data); // Assuming you have a 'welcome.ejs' file in your 'views' folder
  
});


app.get('/change-username/:username', (req, res) => {
  const username = req.params.username;
  console.log(username);
  db.get('SELECT id FROM users WHERE username LIKE ?', [username], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (row) {
      const userId = row.id;
      res.render('changeUsername', { username: username, userId: userId }); // Send the userId to the template
    } else {
      res.send('User not found'); // Handle the case where the username isn't in the database
    }
  });
});





app.post('/change-username', (req, res) => {
  const newUsername = req.body.newUsername;
  const userId = req.body.userId;

  // Define the updateUsername function outside the route handler
  const updateUsername = (userId, newUsername, callback) => {
    db.run('UPDATE users SET username = ? WHERE id = ?', [newUsername, parseInt(userId)], function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.changes); // Returns the number of rows affected
    });
  };

  // Call the updateUsername function to update the database
  updateUsername(userId, newUsername, (err, changes) => {
    if (err) {
      return console.error(err.message);
    }

    console.log(`Username updated. Rows affected: ${changes}`);

    // Assuming you have a function to update the username in the database
    // Update the username in your database here

    res.send(`
      <body style="background-color: #222;color: #fff;font-family: Arial, sans-serif;">

      <p style="text-align:center; margin-top:100px;">Username changed to ${newUsername}</p>
      <form action="/welcome/${newUsername}" method="get" style="text-align:center;">
        <input type="hidden" name="username" value="${newUsername}">
        <button type="submit" style="width: 100%; box-sizing: border-box; padding: 10px; background-color: #00ff00; color: #fff;">Go to Dashboard</button>
      </form>

      </body>
    `);
  });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username=? AND password=?', [username, password], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (row) {
      const data = {
        pageTitle: 'Welcome Page',
        message: `Welcome, ${row.username}!`,
        username: username,
      };
      res.render('welcome', data); // Assuming you have a 'welcome.ejs' file in your 'views' folder
    } else {
      const data = {
        pageTitle: 'Login Page',
        errormessage: 'Invalid username or password.',
        message: 'Login Page',
      };
      res.render('index', data);
    }
  });
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
