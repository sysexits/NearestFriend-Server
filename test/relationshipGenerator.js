var User = require('../app/models/user.js');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var name  = 'test' + parseInt(process.argv[2]);
var query = {username: name};
User.findOne(query, function(err, user){
  var arr = []
  while(arr.length < 100+Math.random()*50){
    var randomnumber=Math.ceil(Math.random()*499)
    var found=false;
    for(var j=0;j<arr.length;j++){
      if(arr[j]==randomnumber){found=true;break}
    }
    if(!found)arr[arr.length]=randomnumber;
  }
  
  arr.sort(function(a,b){
    return a-b;
  });

  
  for(var k=0; k<arr.length; k++) {
    var requestName = 'test' + arr[k];
    var newQuery = {username: requestName};
    console.log(newQuery);
    User.findOne(newQuery, function(err, ruser) {
      user.friendRequest(ruser._id, function(err, request){
        console.log(request);
        ruser.acceptRequest(user._id, function(err, friendship){
          console.log(friendship);
          console.log(user.username + "<->" + ruser.username + ": " + arr.length);
        });
      });
    });
  }
});
