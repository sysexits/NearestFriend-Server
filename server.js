// Set up
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
var port = 8000;

var database = require('./config/database.js');

mongoose.connect(database.url); // connect to mongoDB
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({ secret: 'your-session-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);
require('./app/routes.js')(app, passport);

var server = app.listen(port, function(err) {
  if(err) throw err;
  var host = server.address().address;
  console.log("NF backend listening at http://%s:%s", host, port);
});
