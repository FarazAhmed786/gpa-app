const mongoose = require("mongoose");
const config = require("config");
const conversationSchema = new mongoose.Schema({
  createdDate: { type: Date, default: Date.now },
  // usersInfo: {
  //   type: [Object]
  // }
},{ strict: false });
const ConversationData = mongoose.model("chatRooms", conversationSchema);
exports.ConversationData = ConversationData;