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


app.get('/quiz', (req, res) => {
  const username = req.query.username; // Extracting username from the query parameter
  var id = "";
  var rowIndex = "";
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
  
    if (row) {
      console.log(`User ID for ${username}: ${row.id}`);
      id = row.id;

      db.get('SELECT questionIndex FROM user_answers WHERE id = ?', [parseInt(id)], (err, row) => {
        if (err) {
          return console.error(err.message);
        }
      
        if (row) {
          console.log(`Question Index for ${id}: ${row.questionIndex}`);
          currentQuestionIndex = row.questionIndex;
          rowIndex = row.questionIndex;
        } 
      });

    }
  });



  


  const data = {
    pageTitle: 'Quiz',
    message: `Quiz Answer for ${username}`, // Using the username in the message
    errormessage: '',
  };

  if (currentQuestionIndex < questions.length) {
    const questionData = {
      pageTitle: 'Quiz',
      question: questions[currentQuestionIndex],
      questionNumber: currentQuestionIndex + 1,
      username: username, // Adding username to data for rendering
    };
    res.render('quiz', questionData);
    
    //currentQuestionIndex++;
  
      //
      const query = `
    UPDATE user_answers
    SET questionIndex = ?
    WHERE id = ?;
`;
    rowIndex += 1;
    console.log("Question No: " + rowIndex );
    db.run(query, [currentQuestionIndex, parseInt(id)], function(err) {
      if (err) {
        return console.error(err.message);
      }
      
      console.log(`Row(s) updated: ${this.changes}`);
    });

  } else {
    currentQuestionIndex = 0;
      res.send(`
      <body style="       background-color: #222;color: #fff;font-family: Arial, sans-serif;">
      <p style="text-align:center; margin-top:100px;">Quiz completed for ${username}!</p>
      <br>
      <br>
          <form action="/welcome/${username}" method="get" style="    text-align: center;">
          <input type="hidden" name="username" value="${username}">
          <button type="submit" style="width: 100%; box-sizing: border-box; padding: 10px; background-color: #00ff00; color: #fff;"style="width: 100%; box-sizing: border-box; padding: 10px; background-color: #00ff00; color: #fff;">Go to Dashboard</button>
        </form>
      </body>
   
    `);
    }
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


app.get('/change-username', (req, res) => {
  const username = req.body.username;
  res.render('changeUsername', { username: username});
});


app.post('/change-username', (req, res) => {
  const newUsername = req.body.newUsername;
  const username = newUsername;

  // Assuming you have a function to update the username in the database
  // Update the username in your database here

  res.send(`
  <body style="       background-color: #222;color: #fff;font-family: Arial, sans-serif;">

  <p style="text-align:center; margin-top:100px;">Username changed to ${newUsername}</p>
  <form action="/welcome/${newUsername}" method="get" style="text-align:center;">
    <input type="hidden" name="username" value="${username}">
    <button type="submit" style="width: 100%; box-sizing: border-box; padding: 10px; background-color: #00ff00; color: #fff;">Go to Dashboard</button>
  </form>

  </body>
`);
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
