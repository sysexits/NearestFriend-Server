var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var chatroomSchema = new Schema({
  title: String,
  hash: String,
  users: [{username: String, picture: String}]
}, {collection: 'chatroom_test'});

module.exports = mongoose.model('Chatroom', chatroomSchema);
