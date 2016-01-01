var User = require('./models/user.js');

module.exports = function(app, passport) {
  app.get('/success', function(req, res){
    res.json({'status': '200'});
  });

  app.get('/fail', function(req, res){
    res.json({'status': '404'});
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/success',
    failureRedirect: '/fail',
    failureFlash: false
  }));

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/success',
    failureRedirect: '/fail',
    failureFlash: false
  }));
  
  // RESTful API

  // friend request
  app.post('/api/friendRequest', function(req,res) {
    var data = req.body;
    var query = {username: data.username};
    User.findOne( query, function(err, user){
      if(err) {
        console.log(err);
        res.json({"status": 404});
      } else {
        var requestQuery = {username: data.request_username};
        User.findOne( requestQuery, function(err, requestUser){
          if(err) {
            console.log(err);
            res.json({"status": 404});
          } else {
            user.friendRequest(requestUser._id, function(err, request){
              if(err) {
                console.log(err);
                res.json({"status": 304}); // request has been done before.
              } else {
                console.log('request', request);
                res.json({"status": 200});
              }
            });
          }
        });
      }
    });
  }); 

  // friend accept
  app.post('/api/friendAccept', function(req,res) {
    var data = req.body;
    var query = {username: data.username};
    User.findOne(query, function(err, user) {
      if(err) {
        console.log(err);
        res.json({"status": 404});
      } else {
        var requestQuery = {username: data.request_username};
        User.findOne(requestQuery, function(err, requestUser) {
          if(err) {
            console.log(err);
            res.json({"status": 404});
          } else {
            user.acceptRequest(requestUser._id, function(err, friendship){
              if(err) {
                console.log(err);
                res.json({"status": 304});
              } else {
                console.log("friendship", friendship);
                res.json({"status": 200});
              }
            });
          }
        });
      }
    });
  });
  
  // friend deny
  app.post('/api/friendDeny', function(req,res) {
    var data = req.body;
    var query = {username: data.username};
    User.findOne(query, function(err, user) {
      if(err) {
        console.log(err);
        res.json({"status": 404});
      } else {
        var requestQuery = {username: data.request_username};
        User.findOne(requestQuery, function(err, requestUser) {
          if(err) {
            console.log(err);
            res.json({"status": 404});
          } else {
            user.denyRequest(requestUser._id, function(err, denied){
              if(err) {
                console.log(err);
                res.json({"status": 304});
              } else {
                console.log("friendship", denied);
                res.json({"status": 200});
              }
            });
          }
        });
      }
    });
  });
  
  // get friends
  app.post('/api/getFriends', function(req, res) {
    var data = req.body;
    var query = {username: data.username};
    User.findOne(query, function(err, user) {
      if(err) {
        console.log(err);
        res.json({"status": 404});
      } else {
        user.getFriends(function(err, friends) {
          if(err) {
            console.log(err);
            res.json({"status": 304});
          } else {
            console.log('friends', friends);
            sendData = {"status": 200, "friends": []};
            for(var i=0; i < friends.length; i++) {
              person = {};
              person.username = friends[i].username;
              sendData.friends.push(person); 
            }
            res.json(sendData);
          }
        });
      }
    });
  });

  // get friends of frineds
  app.post('/api/getFriendsOfFriends', function(req, res) {
    var data = req.body;
    var query = {username: data.username};
    User.findOne(query, function(err, user) {
      if(err) {
        console.log(err);
        res.json({"status": 404});
      } else {
        user.getFriendsOfFriends(function(err, fof) {
          if(err) {
            console.log(err);
            res.json({"status": 304});
          } else {
            console.log('friends of friends', fof);
            sendData = {"status": 200, "friendsOfFriends": []};
            for(var i=0; i < fof.length; i++) {
              person = {};
              person.username = fof[i].username;
              sendData.friendsOfFriends.push(person); 
            }
            res.json(sendData);
          }
        });
      }
    });
  });


};
