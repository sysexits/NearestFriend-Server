var User = require('../app/models/user.js');
var fs = require('fs');
var faker = require('Faker');
var https = require('https');
var async = require('async');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

fs.readFile('./geo.txt', 'utf8', function(err, data){
  if(err) throw err;
  var lines = data.split(/\r?\n/);
  var test = [];
  var start = parseInt(process.argv[2]);
  for(var i=start; i<start+25; i++){
    test.push(i); 
  }
  async.map(test, function(item){
    var options = {
      host: 'randomuser.me',
      port: 443,
      path: '/api/',
      method: 'GET',
      headers: {
        accept: '*/*'
      }
    };
    https.get(options, function(res){
      var body = '';
      res.on('data', function(chunk){
        body += chunk;
      });
      res.on('end', function(){
        String.prototype.capitalizeFirstLetter = function() {
          return this.charAt(0).toUpperCase() + this.slice(1);
        }
        var dataSplittedByComma = lines[item].split(/,/);
        var latitude = dataSplittedByComma[1];
        var longitude = dataSplittedByComma[3];

        var response = JSON.parse(body);
        var user = response.results[0].user;
        var name = user.name.first.capitalizeFirstLetter() + " " + user.name.last.capitalizeFirstLetter();  
        var picture = user.picture.medium;
        
        var newUser = new User();
        newUser.username = "test" + item;
        newUser.password = newUser.generateHash(1234);
        newUser.realname = name;
        newUser.picture = picture;
        newUser.latitude = latitude;
        newUser.longitude = longitude;
        newUser.status = Math.floor(Math.random() * 5);
        newUser.subscription = []; 

        console.log(newUser);

        newUser.save(function(err){
          if(err)
            throw err;
          return;
        });
      });
    });
  }, function(err, results){
    console.log(results);
  });
});
