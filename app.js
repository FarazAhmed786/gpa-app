var createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const indexRouter = require("./routes/index");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cors = require("cors");
const socket = require("./webSockets/sockets");
const { ConversationData } = require("./Models/conversation.model");
const { MessageData } = require("./Models/mesage.model");
const { UserData } = require("./Models/user.model");
const { fromPairs } = require("lodash");
//***** ///// *****//
var app = express();
var io = require("socket.io")();
app.io = io;
mongoose
  .connect(
    "mongodb+srv://abdulbhai:W123456@cluster0-71cfj.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .catch((err) => console.error("Could not connect to database...", err));

//***** ///// *****//
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
// app.use(cors());
app.use(cors({
  origin:['http://localhost:8081','http://127.0.0.1:8081'],
  credentials:true
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public/images")));
app.set("view engine", "ejs");
app.use("/public", express.static("public"));
app.use("/api", indexRouter);
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "http://localhost:8081");
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});

app.io.on("connection", async function (client) {

  client.on('createRoom', async (e) => {
    const roomData = {}
    e.users.forEach(user => roomData[user._id] = true)
    if(e.roomType == 'ptp') {
      const isFoundRoom = await ConversationData.findOne({...roomData, roomType:'ptp'})
      if(isFoundRoom) {
        client.emit('getRoom', isFoundRoom )
        return
      }
    }
    roomData.usersInfo = e.users
    roomData.roomType = e.roomType
    if(e.roomType == 'group') {
      roomData.roomName = e.roomName
    }
    if(e.partyId){
      roomData.partyId = e.partyId
    }
    if(e.partyDetails){
      roomData.partyDetails = e.partyDetails
    }
    if(e.image){
      roomData.image = e.image
    }
    console.log("roomData", roomData)
    const newRoom = new ConversationData(roomData);
    console.log("newRoom-----------", newRoom)
    client.emit('getRoom', newRoom )
    const roomResult = await newRoom.save();
    console.log("roomResult", roomResult)
  })

  client.on('sentMsg', async (msg) => {
   const newMessage = new MessageData(msg);
    const res = await newMessage.save();
    if(res.type == 'audioCall' || res.type == 'videoCall') {
      const roomData = await ConversationData.findOne({_id : res.roomId})
      let data = {
        roomData,
        ...res._doc
      }
      app.io.emit('newChat', data )
      let allMessages = await MessageData.find({roomId: msg.roomId});
      app.io.emit("getMessages", allMessages);
    } else {
        app.io.emit('newChat', res )
        let allMessages = await MessageData.find({roomId: msg.roomId});
        app.io.emit("getMessages", allMessages);
    }
  })
  
  client.on('findMsgs', async (roomId) => {
    console.log("findMsgs--", roomId)
    let allMessages = await MessageData.find({roomId});
    app.io.emit("getMessages", allMessages);
  })

  client.on('find-rooms', async id => {
  console.log("getRooms -- > ayan -- > id", id)
    const allRooms = await ConversationData.find({[id]: true})
    const IDs = []
    allRooms.forEach(val => {
      const datas = JSON.parse(JSON.stringify(val))
      datas.usersInfo.forEach(val => {
        if(IDs.includes(val._id)) return
        IDs.push(val._id)
      })
    })

    const userData = await UserData.find({ _id: { $in: IDs}})
    
    const newAllRooms = []
    allRooms.forEach(val => {
      const datas = JSON.parse(JSON.stringify(val))
      var newUsersInfo = []
      datas.usersInfo.forEach(val => {
        userData.forEach(jl => {
          if(jl._id == val._id){
            newUsersInfo.push(jl)
          }
        })
      })
      datas.usersInfo = newUsersInfo
      newAllRooms.push(datas)
    })
    client.emit('getRooms', newAllRooms)
  })

  // client.on("sign-in", async (e) => {
  //   await ConversationData.find()
  //     .populate({
  //       path: "receiver",
  //       model: "users",
  //     })
  //     .populate({
  //       path: "creator",
  //       model: "users",
  //     })
  //     .exec(function (err, data) {
  //       console.log(data, "ssssssssssssssss");
  //       app.io.emit("getAll", { conversation: data });
  //     });
  // });
  // client.on("getConvo", async (e) => {
  //   let convo = await ConversationData.find();

  //   // console.log("<>", e);

  //   convo.map((v) => {
  //     if (
  //       (v.creator === e.currentUser && v.receiver === e.receiver) ||
  //       (v.creator === e.currentUser && v.receiver === v.currentUser)
  //     ) {
  //       // (v.creator === e.currentUser && v.receiver === e.receiver)

  //       console.log(v);
  //       // app.io.emit("getConversationId", { conversation: convo });
  //     }
  //   });
  // });

  // client.on("filter-messages", async (e) => {
  //   // let alreadyConvo = await // ConversationData.find({
  //   // //   creator: from,
  //   // //   receiver: to,
  //   // // });
  //   // ConversationData.findById(e);
  //   // if (alreadyConvo.creator == userId || alreadyConvo.receiver == userId) {
  //     // console.log(alreadyConvo, "oooooooooooo111111111ooooooooooo");
  //     let allMessages = await MessageData.find({
  //       conversationId: e
  //     });
  //     app.io.emit("getMessages", allMessages);
  //   // }
  // });

  // client.on("message", async (e) => {
  //   let from = e.from;
  //   let to = e.to;
  //   // let alreadyConvo = await ConversationData.find({ creator: from });

  //   let alreadyConvo = await // ConversationData.find({
  //   //   creator: from,
  //   //   receiver: to,
  //   // });
  //   ConversationData.find({
  //     $and: [
  //       {
  //         $or: [{ creator: from }, { creator: to }],
  //       },
  //       { $or: [{ receiver: from }, { receiver: to }] },
  //     ],
  //   });
  //   // let alreadyChat = await ConversationData.find({
  //   //   creator: to,
  //   //   receiver: from,
  //   // });
  //   if (alreadyConvo.length) {
  //     let message = {
  //       conversationId: alreadyConvo[0]._id,
  //       author: e.from,
  //       text: e.msg,
  //     };
  //     const newMessage = new MessageData(message);

  //     const messageResult = await newMessage.save();
  //     app.io.emit("messageSave", { msg: messageResult });

  //     // app.io.emit("message", { msg: messageResult });
  //     //  else if (
  //     //   alreadyChat[0].receiver == e.from &&
  //     //   alreadyChat[0].creator == e.to
  //     // ) {
  //     //   let message = {
  //     //     conversationId: alreadyChat[0]._id,
  //     //     author: e.from,
  //     //     text: e.msg,
  //     //   };
  //     //   const newMessage = new MessageData(message);
  //     //   const messageResult = await newMessage.save();
  //     //   app.io.emit("message", { msg: messageResult });
  //     // }
  //   } else {
  //     let newConversation = {
  //       // _id: items._id,
  //       convoId: e.from,
  //       receiver: e.to,
  //       creator: e.from,
  //     };
  //     const conversation = new ConversationData(newConversation);
  //     var result = await conversation.save();
  //     let message = {
  //       // _id: result._id,
  //       conversationId: result._id,
  //       author: e.from,
  //       text: e.msg,
  //     };
  //     const newMessage = new MessageData(message);
  //     const messageResult = await newMessage.save();
  //     app.io.emit("messageSave", { msg: messageResult });

  //     //
  //   }
  // });
  // client.on("disconnect", function () {
  //   if (!client.user_id || !clients[client.user_id]) {
  //     return;
  //   }
  //   let targetClients = clients[client.user_id];
  //   for (let i = 0; i < targetClients.length; ++i) {
  //     if (targetClients[i] == client) {
  //       targetClients.splice(i, 1);
  //     }
  //   }
  // });

});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
module.exports = app;
