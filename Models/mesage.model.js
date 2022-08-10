
const mongoose = require('mongoose');
const config = require('config');


const MessageSchema = new mongoose.Schema({
  createdDate: { type: Date, default: Date.now },
},{ strict: false });

const MessageData = mongoose.model('message', MessageSchema);


exports.MessageData = MessageData;