var User = require('./models/user.js');
var Chatroom = require('./models/chatroom.js');
var geolib = require('geolib');
var bcrypt = require('bcrypt-nodejs');

module.exports = function(app, passport, client) {
  
  app.get('/success', function(req, res){
    res.json({'status': 200});
  });

  app.get('/fail', function(req, res){
    res.json({'status': 404});
  });

  app.post('/stompTest', function(req, res) {
    var data = req.body;
    var destination = "/queue/" + data.username;
    client.send(destination, {action:"test", test: "testVal", arrayTest: ["elem1", "elem2"]}, "Message Sent");
    res.json({"status": 200});
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
                var destination = "/queue/" + data.request_username;
                var message = data.username + "is sent a friend request " + data.request_username; 
                client.send(destination, {'action': 'requestFriendRequest', 'username': data.username, 'realname': user.realname, 'picture': user.picture}, message);
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
            sendData = {"status": 200, "friendPendingRequests": []};
            for(var i=0; i<pendings.length; i++) {
              person = {};
              person.username = pendings[i].username;
              person.realname = pendings[i].realname;
              person.picture  = pendings[i].picture;
              sendData.friendPendingRequests.push(person);
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
            sendData = {"status": 200, "getFriends": []};
            for(var i=0; i < friends.length; i++) {
              person = {};
              person.username = friends[i].username;
              person.realname = friends[i].realname;
              person.latitude = friends[i].latitude;
              person.longitude = friends[i].longitude;
              person.status = friends[i].status;
              person.picture = friends[i].picture;
              sendData.getFriends.push(person); 
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
            sendData = {"status": 200, "getFriendsOfFriends": []};
            for(var i=0; i < fof.length; i++) {
              person = {};
              person.username = fof[i].username;
              person.realname = fof[i].realname;
              person.latitude = fof[i].latitude;
              person.longitude = fof[i].longitude;
              person.status = fof[i].status;
              person.picture = fof[i].picture;
              sendData.getFriendsOfFriends.push(person); 
            }
            res.json(sendData);
          }
        });
      }
    });
  });

  app.post('/api/getPeople', function(req, res) {
    var data = req.body;
    var query = {'username': data.username};
    User.findOne(query, function(err, user){
      if(err) {
        console.log(err);
        res.json({'status': 500});
      } else if(!user) {
        res.json({'status': 404});
      } else {
        res.locals.getAll = [];
        user.getFriends(function(err, friends) {
          if(err) {
            console.log(err);
            res.json({"status": 304});
            return;
          } else {
            for(var i=0; i<friends.length; i++) {
              if(friends[i].status == data.status && geolib.getDistance({latitude: data.latitude, longitude: data.longitude}, {latitude: friends[i].latitude, longitude:friends[i].longitude}) <= data.distance) {
                person = {};
                person.username = friends[i].username;
                person.realname = friends[i].realname;
                person.picture = friends[i].picture;
                person.latitude = friends[i].latitude;
                person.longitude = friends[i].longitude;
                res.locals.getAll.push(person);
              }
            }

            user.getFriendsOfFriends(function(err, fof) {
              if(err) {
                res.json({'status': 304});
                return;
              } else {
                for(var i=0; i<fof.length; i++) {
                  if(fof[i].status == data.status && geolib.getDistance({latitude: data.latitude, longitude:data.longitude}, {latitude:fof[i].latitude, longitude:fof[i].longitude})<= data.distance) {
                    person = {};
                    person.username = fof[i].username;
                    person.realname = fof[i].realname;
                    person.picture = fof[i].picture;
                    person.latitude = fof[i].latitude;
                    person.longitude = fof[i].longitude;
                    res.locals.getAll.push(person);
                  } 
                } 
                res.json({"status": 200, "getPeople": res.locals.getAll});
              }
            });
          }
        });
      }
    }) 
  });

  // Update user information
  app.post('/api/updateStatus', function(req, res){
    var data = req.body;
    var query = {username: data.username};
    var update_query = {status: data.status};
    var options = {new: false};
    User.findOneAndUpdate(query, update_query, options, function(err, user){
      if(err) {
        console.log(err);
        res.json({"status": 404});
      } else {
        res.json({"status": 200});
      }
    });
  });

  app.post('/api/updateLocation', function(req, res){
    var data = req.body;
    var query = {username: data.username};
    var update_query = {latitude: data.latitude, longitude: data.longitude};
    var options = {new: false};
    User.findOneAndUpdate(query, update_query, options, function(err, user){
      if(err) {
        console.log(err);
        res.json({"status": 404});
      } else {
        res.json({"status": 200});
      }
    });
  });

  app.post('/api/updatePicture', function(req, res){
    var data = req.body;
    var query = {username: data.username};
    var update_query = {picture: data.picture};
    var options = {new: false};
    User.findOneAndUpdate(query, update_query, options, function(err, user){
      if(err) {
        console.log(err);
        res.json({"status": 404});
      } else {
        res.json({"status": 200});
      }
    });
  });

  // Chatroom APIs  
  app.post('/api/getChatrooms', function(req, res){
    var data = req.body;
    var username = data.username;
    User.findOne({username: username}, function(err,user){
      if(err) {
        res.json({"status": 500});
      } else if(!user) {
        res.json({"status": 404});
      } else {
        var subscription = user.subscription;
        var list = [];
        function asyncLoop(i, cb) {
          if(i < subscription.length) {
            var query = {hash: subscription[i]};
            console.log(query);
            Chatroom.findOne(query, function(err, room){
              if(err) {
                console.log(err);
              } else if(!room) {
                console.log("Not found");
              } else {
                var info = {hash: room.hash, users: room.users};
                list.push(info); 
                asyncLoop(i+1, cb);
              }
            });
          } else {
            console.log(list);
            cb();
          }
        }

        asyncLoop(0, function() {
          res.json({"status":200, "getChatrooms": list});
        });
      }
    });
  });

  // Chatroom related function
  app.post('/api/inviteChatroom', function(req, res){
    var data = req.body;
    var host = data.username;
    var hostRealname = data.realname;
    var invite = eval(data.invite);
    var hashString = invite.toString() + "," + host + "," + Date.now;
    var hash = bcrypt.hashSync(hashString, bcrypt.genSaltSync(8));
    for(var i=0; i<invite.length; i++) {
      var destination = '/queue/' + invite[i];
      var message = host + " invites " + invite[i];
      client.send(destination, {'action': 'inviteChatroom', 'username': host, 'realname': hostRealname, 'hash': hash}, message);
    }
    res.json({'status': 200, 'hash': hash});
  });

  app.post('/api/acceptInvite', function(req, res){
    var data = req.body;
    var username = data.username;
    var hash = data.hash;
    var query = {hash: hash};

    Chatroom.findOne(query, function(err, room) {
      if(err) {
        res.json({"status": 500});
      } else if(!room) {
        var newRoom = new Chatroom();
        newRoom.title = data.title; 
        newRoom.hash = data.hash;
        newRoom.users.push(username);
        newRoom.save(function(err) {
        });
      
        User.findOneAndUpdate({username: username}, {$push: {subscription: hash}}, {safe:true, upsert:true},function(err, user){
          if(err) {
            res.json({"status": 500});
          }
        });

        res.json({"status": 200});
      } else {
        room.users.push(username);
        room.save(function(err) {
        });
        
        User.findOneAndUpdate({username: username}, {$push: {subscription: hash}}, {safe:true, upsert:true}, function(err, user){
          if(err) {
            res.json({"status": 500});
          }
        });
        res.json({"status": 200});
      }
    });
  });

  app.post('/api/exitChatroom', function(req, res){
    var data = req.body;
    var username = data.username;
    var hash = data.hash;
    User.findOneAndUpdate({username:username}, {$pull: {subscription: hash}}, {safe:true, upsert:true}, function(err, user){
      if(err) {
        res.json({'status': 500});
      } else if(!user) {
        res.json({'status': 404});
      } else {
        Chatroom.findOneAndUpdate({'hash':hash}, {$pull: {users:username}}, {safe:true, upsert:true}, function(err, chat){
          if(err) {
            console.log(err);
            res.json({'status': 500});
          } else if(!chat) {
            res.json({'status': 404});
          } else {
            res.json({'status': 200});
          }
        });
      }
    });
  });
};
