var options = {
  personModelName: 'User',
  friendshipModelName: 'Friendship',
  friendshipCollectionName: 'friendships'
}

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var friendOfFriends = require('friends-of-friends')(mongoose, options);

var chatroomSchema = require('./chatroom.js');

var Schema = mongoose.Schema;
var userSchema = new Schema({
  username: String,
  password: String,
  realname: String,
  picture: String,
  latitude: Number,
  longitude: Number,
  status: Number,
  subscription: [String]
}, {collection: 'nfdb_test'});

userSchema.plugin(friendOfFriends.plugin, options);

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);
