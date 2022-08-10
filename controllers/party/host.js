
//***** Modules goes here *****//
const express = require('express');
const Joi = require('joi');
const { PartyData } = require('../../Models/party.model');
const upload = require("../../constants/multer");
const cloudinary = require("../../constants/cloudinary");
const fs = require("fs");
const auth = require('../../middleware/auth');
const { UserData } = require('../../Models/user.model');
const fetch = require('node-fetch');

const app = express();

app.post('/', auth,
  upload.fields([{ name: "image" }]),
  async (req, res) => {

    req.body.members = JSON.parse(req.body.members);
    const { error } = validateApiData(req.body);

    if (error) {
      var errors = {
        success: false,
        msg: error.name,
        data: error.details[0].message
      };
      res.status(403).send(errors);
      return;
    }

    const file = req.files.image;
    if (file == null) {
      var errors = {
        success: false,
        msg: 'Party Image is required'
      };
      res.status(403).send(errors);
      return;
    }

    const image = async (path) => await cloudinary.uploads(path, "partyImage");
    const img = req.files.image[0];
    const { path } = img;
    const imgURL = await image(path);
    fs.unlinkSync(path);
    req.body.image = imgURL.url;

    // const alreadyExist = req.body.members.map((m) => {
    //   if(m.isOwner != true && m.status != 1){
    //     return m.phone
    //   }
    // });

    // const checkIfExist = await PartyData.findOne({
    //   "members.phone": {  $in: alreadyExist },
    //   "members.isOwner": true
    // })

    const user = await UserData.findOne({ _id: req.user._id });
    const checkIfExist = await PartyData.findOne({
      "members.$.phone": user.mobile,
      "members.$.isOwner": true
    })

    if (checkIfExist != null) {
      var errors = {
        success: false,
        msg: 'Can not create multiple parties. Please delete the previous one and try again.'
      };
      res.status(409).send(errors);
      return;
    }

    await hostParty(req.body)
      .then(async result => {
        var success = {
          success: true,
          msg: 'Party created successfully!',
          data: result
        };

        inviteNotification(req.body)
          .then(() => {
            res.send(success);
            return;
          })
      })
      .catch(ex => {
        res.send(ex);
        return;
      })
  })

async function hostParty(body) {
  return new Promise((resolve, reject) => {
    try {
      if (!body.isSubscribed)
        body.isSubscribed = false;
      const party = new PartyData(body);
      const result = party.save();
      resolve();
    }
    catch (err) {
      reject(err);
    }
  })
}

function validateApiData(body) {
  const schema = Joi.object().keys({
    event_name: Joi.string().required(),
    date: Joi.date().required(),
    from_time: Joi.string().regex(/\b((1[0-2]|0?[1-9]):([0-5][0-9]))/).required(),
    till_time: Joi.string().regex(/\b((1[0-2]|0?[1-9]):([0-5][0-9]))/).required(),
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
    members: Joi.array().items(
      Joi.object({
        phone: Joi.number().required(),
        isOwner: Joi.boolean().required(),
        status: Joi.number().required()
      })
    ),
    isSubscribed: Joi.boolean().optional()
  });
  return Joi.validate(body, schema)
}

const inviteNotification = async (body) => {

  let phone_nos = [];
  phone_nos = body.members.map(x => {

    if(x.isOwner != true){
      return x.phone;
    }
  })

  let users = [];
  users = await UserData.find({ mobile: { $in: phone_nos } });

  if (users == null)
    return;

  const data = {
    title: 'Party Invitation',
    msg: 'You are invited to party with Us! Click to see details'
  }

  var key = 'AAAAe6315E8:APA91bEGumEyzyH6nUeCUWPl6I08niXGRN7mEbhrzf7T2ivyoACP7CA5kV2IxDw6sxNF0_jPgCUeFN6g5sfaNXQBRRBQowiTkHjs3C-m2EOUECLG-qsqU9C0Wpr3Cl2kwSqmY2O8Ui40';
  users.map(x => {
 
  return new Promise((resolve, reject) => {
 
     fetch('https://fcm.googleapis.com/fcm/send', {
       'method': 'POST',
       'headers': {
         'Authorization': 'key=' + key,
         'Content-Type': 'application/json'
       },
       'body': JSON.stringify({
        'to': x.gcm_id, 'notification': data, 'data': {
          type: 'party',
          body,
        },
        'priority': "high",
        time_to_live: 5,
        content_available: true
      })
     }).then(function (response) {
       console.log('SendNotification', response, 'response')
       resolve()
     }).catch(function (error) {
       console.log(error, 'error')
       reject(error)
     });
   })
  })
}

module.exports = app;
