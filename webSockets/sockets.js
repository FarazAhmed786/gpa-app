const express = require("express");
var router = express.Router();
var app = express();
var io = require('socket.io')();
const {ConversationData} = require('../Models/conversation.model')
app.io = io;
app.io.on("connection",async function(client) {
  client.on("sign-in",async e => {
    const convo = await ConversationData.find({creator:e._id})
    app.io.emit("getAll",{conversation:convo})
    console.log("aaaaaaaaaaa",e)
  
  });

  client.on("message", e => {
    let targetId = e.to;
    console.log(e)
    let sourceId = client.user_id;
    console.log(client.user_id,clients)
    cli.emit("message", e);
    if(targetId && clients[targetId]) {
      clients[targetId].forEach(cli => {
        console.log("asasas",cli)
        cli.emit("message", e);
      });
    }

    if(sourceId && clients[sourceId]) {
      clients[sourceId].forEach(cli => {
        console.log("asasas",cli)
        cli.emit("message", e);
      });
    }
  });

  client.on("disconnect", function() {
    if (!client.user_id || !clients[client.user_id]) {
      return;
    }
    let targetClients = clients[client.user_id];
    for (let i = 0; i < targetClients.length; ++i) {
      if (targetClients[i] == client) {
        targetClients.splice(i, 1);
      }
    }
  });
});
  module.exports = app;

//***** ///// *****//

// view engine setup