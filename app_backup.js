/*
 * Modules
 */
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');

// Connect to DB
mongoose.connect('mongodb://localhost/test');

// Define user schema, model
var Schema = mongoose.Schema;
var userSchema = new Schema({
  username: String,
  latitude: Number,
  longitude: Number,
}, {collection: 'nfdb_test'});

var Users = mongoose.model('Users', userSchema);

// Define REST server
var app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

// Define route methods

// API route
app.post('/api/sendlocation', function(req, res) {
  var data = req.body;
  var query = {username: data.username};
  var update = {latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude)};
  var options = {new: false};
  var status_code = 0;
  Users.findOneAndUpdate(query, update, options, function(err, user){
    if(err) {
      console.log(err);
    }
    console.log(user);
  });
  res.json({"status": status_code});
});

var server = app.listen(8000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("NearestFriend backend listening at http://%s:%s", host, port);
});
