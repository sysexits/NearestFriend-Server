// Set up
var express = require('express');
var mongoose = require('mongoose');
var friendOfFriends = require('friends-of-friends')(mongoose);
var passport = require('passport');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var Stomp = require('stompjs');

var app = express();
var port = 8000;
if (process.argv.length == 3) {
  port = process.argv[2];
}

var database = require('./config/database.js');

mongoose.connect(database.url); // connect to mongoDB
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({ secret: '9d4b6a8cd7a352a12996d7d6be2fff56781b122744a81cfd518734373610ee58', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);
require('./app/routes.js')(app, passport);

var server = app.listen(port, function(err) {
  if(err) throw err;
  var host = server.address().address;
  console.log("NF backend listening at http://%s:%s", host, port);
});
