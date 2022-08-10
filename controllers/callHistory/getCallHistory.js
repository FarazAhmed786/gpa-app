
//***** Modules goes here *****//
const express = require('express');
const { MessageData } = require('../../Models/mesage.model');
const { ConversationData } = require('../../Models/conversation.model');
const { UserData } = require("../../Models/user.model");

const Joi = require('joi');


const app = express();

app.get('/', async (req, res) => {
    const { error } = validateApiData(req.query);

    if (error) {
        var errors = {
            success: false,
            msg: error.name,
            data: error.details[0].message
        };
        res.status(403).send(errors);
        return;
    }

    const callHistory = await getUserCallHisory(req.query.userId)

    var success = {
        success: true,
        msg: 'Call History Found',
        data: callHistory
      };
      res.send(success);
})

async function getUserCallHisory(userId) {

    let roomsData = await ConversationData.find({[userId]: true})
    let IDss = roomsData.map(val =>  val._id.toString() )
    let data = await MessageData.find({
        roomId: {  $in: IDss },
        $or: [{type: 'audioCall'}, {type: 'videoCall'}]
    })

    const IDs = []
    roomsData.forEach(val => {
      const datas = JSON.parse(JSON.stringify(val))
      datas.usersInfo.forEach(val => {
        if(IDs.includes(val._id)) return
        IDs.push(val._id)
      })
    })

    const userData = await UserData.find({ _id: { $in: IDs}})
    
    const newAllRooms = []
    roomsData.forEach(val => {
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

    return {callHistory: data, roomsData: newAllRooms}
}

function validateApiData(req) {
    const schema = Joi.object().keys({
        userId: Joi.string().required(),
    });
    return Joi.validate(req, schema)
}

module.exports = app;
