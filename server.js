const express = require('express');
const app = express();
User = require('./models/user');
const port = 3000;

// static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));

// set views
app.set('views', './views');
app.set('view engine', 'ejs');

app.get('', (req, res) => {
  res.render('index');
});

app.get('/browse', (req, res) => {
  res.render('browse');
});

app.get('/account', (req, res) => {
  res.render('account');
});

app.get('/additem', (req, res) => {
  res.render('additem');
});

app.get('/browsewanted', (req, res) => {
  res.render('browsewanted');
});

app.get('/communities', (req, res) => {
  res.render('communities');
});

app.get('/community', (req, res) => {
  res.render('community');
});

app.get('/communityform', (req, res) => {
  res.render('communityform');
});

app.get('/eventpage', (req, res) => {
  res.render('eventpage');
});

app.get('/events', (req, res) => {
  res.render('events');
});

app.get('/indexloggedin', (req, res) => {
  res.render('indexloggedin');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/offeritem', (req, res) => {
  res.render('offeritem');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/wanteditem', (req, res) => {
  res.render('wanteditem');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}!`);
});
