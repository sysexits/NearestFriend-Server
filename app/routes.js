var User = require('./models/user.js');
var Chatroom = require('./models/chatroom.js');
var geolib = require('geolib');

module.exports = function(app, passport) {
  
  app.get('/success', function(req, res){
    res.json({'status': 200});
  });

  app.get('/fail', function(req, res){
    res.json({'status': 404});
  });

  app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info){
      if(err) {console.log(err); return res.json({"status": 500});} // internal service error
      if(!user) {return res.json({"status": 404});}
      
      sendData = {'status': 200};
      sendData.username = user.username;
      sendData.realname = user.realname;
      sendData.picture = user.picture;
      res.json(sendData);
    })(req, res, next);
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/success',
    failureRedirect: '/fail',
    failureFlash: false
  }));
  
  // RESTful API

  // friend request
  app.post('/api/friendRequest', function(req,res) {
    var data = req.body;
    var query = {'username': data.username};
    User.findOne( query, function(err, user){
      if(err) {
        console.log(err);
        res.json({"status": 500});
      } else if(!user) {
        res.json({'status': 404});
      } else {
        var requestQuery = {'username': data.request_username};
        User.findOne( requestQuery, function(err, requestUser){
          if(err) {
            console.log(err);
            res.json({"status": 500});
          } else if(!requestUser) {
            res.json({'status': 404});
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

  // get pending requests
  app.post('/api/friendPendingRequests', function(req, res) {
    var data = req.body;
    var query = {'username' : data.username};
    User.findOne(query, function(err, user) {
      if(err) {
        console.log(err);
        res.json({'status': 500}); 
      } else if(!user) {
        res.json({"status": 404});
      } else {
        user.getPendingFriends(user._id, function(err, pendings) {
          if(err) {
            console.log(err);
            res.json({"status": 500});
          } else {
            console.log("request", pendings);
            sendData = {"status": 200, "pendings": []};
            for(var i=0; i<pendings.length; i++) {
              person = {};
              person.username = pendings[i].username;
              sendData.pendings.push(person);
            }
            res.json(sendData);
          }
        });
      }
    });
  });

  // friend accept
  app.post('/api/friendAccept', function(req,res) {
    var data = req.body;
    var query = {'username': data.username};
    User.findOne(query, function(err, user) {
      if(err) {
        console.log(err);
        res.json({'status': 500});
      } else if(!user) {
        res.json({"status": 404});
      } else {
        var requestQuery = {'username': data.request_username};
        User.findOne(requestQuery, function(err, requestUser) {
          if(err) {
            console.log(err);
            res.json({'status': 500}); 
          } else if(!requestUser) {
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
    var query = {'username': data.username};
    User.findOne(query, function(err, user) {
      if(err) {
        console.log(err);
        res.json({'status': 500});
      } else if(!user) {
        res.json({"status": 404});
      } else {
        var requestQuery = {'username': data.request_username};
        User.findOne(requestQuery, function(err, requestUser) {
          if(err) {
            console.log(err);
            res.json({'status': 500});
          } else if(!requestUser) {
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
    var query = {'username': data.username};
    User.findOne(query, function(err, user) {
      if(err) {
        console.log(err);
        res.json({'status': 500}); 
      } else if(!user) {
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
              person.latitude = friends[i].latitude;
              person.longitude = friends[i].longitude;
              person.status = friends[i].status;
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
    var query = {'username': data.username};
    User.findOne(query, function(err, user) {
      if(err) {
        console.log(err);
        res.json({'status': 500}); 
      } else if(!user) {
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
              person.latitude = fof[i].latitude;
              person.longitude = fof[i].longitude;
              person.status = fof[i].status;
              sendData.friendsOfFriends.push(person); 
            }
            res.json(sendData);
          }
        });
      }
    });
  });

  app.post('/api/getPeople', function(req, res) {
    var data = req.data;
    var query = {'username': data.username};
    var getAll = [];
    User.findOne(query, function(err, user){
      if(err) {
        console.log(err);
        res.json({'status': 500});
      } else if(!user) {
        res.json({'status': 404});
      } else {
        user.getFriends(function(err, friends) {
          if(err) {
            console.log(err);
            res.json({"status": 304});
            return;
          } else {
            console.log('friends', friends);
            for(var i=0; i<friends.length; i++) {
              if(friends[i].status == data.status && geolib.getDistance({latitude: data.latitude, longitude: data.longitude}, {latitude: friends[i].latitude, longitude:friends[i].longitude}) <= data.length) {
                person = {};
                person.username = friends[i].username;
                getAll.push(person);
              }
            }
          }
        });
        user.getFriendsOfFriends(function(err, fof) {
          if(err) {
            console.log(err);
            res.json({'status': 304});
            return;
          } else {
            for(var i=0; i<fof.length; i++) {
              if(fof[i].status == data.status && geolib.getDistance({latitude: data.latitude, longitude:data.longitude}, {latitude:fof[i].latitude, longitude:fof[i].longitude})) {
                person = {};
                person.username = fof[i].username;
                getAll.push(person);
              } 
            } 
          }
        });
        res.json({'status': 200, 'data': getAll})
      }
    }) 
  });
};
