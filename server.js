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

app.use(session({ secret: 'c5bc88d7ef5ea3a370102d72abd6af662ecb5c1585e85841c5379d6949f99d47', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);
require('./app/routes.js')(app, passport);

var server = app.listen(port, function(err) {
  if(err) throw err;
  var host = server.address().address;
  console.log("NF backend listening at http://%s:%s", host, port);
});
