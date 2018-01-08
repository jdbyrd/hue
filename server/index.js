const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const helpers = require('./helpers');
const db = require('../database/index');
const insert = require('../database/inserts');
const query = require('../database/queries');


const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/../client/dist'));
app.use(session({secret: 'dont hack me brah'}));


app.get('/entries', (req, res) => {
  query.entries().then(data => {res.json(data)});
});

app.get('/comments', (req, res) => {

  //req.body must contain entryid for comments you want

  let entryid = req.body.entryid;
  query.comments(entryid).then(data => {res.json(data)});

});

app.post('/entries', (req, res) => {
  if(req.session.user){
    let entry = req.body;
    entry.user = req.session.user;
    insert.entry(entry);
    res.send('added entry');
  }else{
    res.send('entry not added; user not logged it');
  }
});

app.post('/comments', (req, res) => {
  insert.comment(req.body);
  res.send('added comment');
});


/************************************************************/
// Authentication routes
/************************************************************/

app.post('/signup', (req, res) => {
	helpers.hashPassword(req)
  .then(() => {
    helpers.createSession(req, function() {
      res.send('Congratulations! Welcome to hue.');
    })
	})
  .catch(() => {
    res.send('Sorry that username already exists.');
  })
});

app.post('/login', (req, res) => {
  helpers.identifyUser(req)
  .then(() => {
    helpers.createSession(req, function() {
      res.send('Login successful');
    })      
  })
  .catch((result) => {
    res.send(result);
  })
});

app.post('/logout', (req, res) => {
  req.session.destroy(function() {
    res.send('Thanks for visiting!')
  })
});

app.get('/submit', helpers.checkUser, (req, res) => {
  res.send(true); //req.session.user
});

/************************************************************/
/************************************************************/

let port = process.env.port || 1234;

app.listen(1234, () => console.log(`Example app listening on port ${port}!`))