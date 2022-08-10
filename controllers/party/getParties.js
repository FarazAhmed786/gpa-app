
//***** Modules goes here *****//
const express = require('express');
const { number } = require('joi');
const { PartyData } = require('../../Models/party.model');
const { UserData } = require('../../Models/user.model');

const app = express();

app.get('/', async (req, res) => {

  try {
    let getParties;
    if (req.query.userId != null && req.query.partyId == null) {

      const user = await UserData.findOne({ _id: req.query.userId });
      getParties = await PartyData.find({ "members.phone": user.mobile })
        .sort({ createdDate: -1 })

    }
    else if (req.query.userId == null && req.query.partyId != null) {

      getParties = await PartyData.findOne({ _id: req.query.partyId })
        .sort({ createdDate: -1 })

    }
    else {
      var error = {
        success: false,
        msg: 'Please enter User OR Party ID',
        data: ''
      };
      res.status(500).send(error);
      return;
    }

    if (getParties.length == 0) {
      var error = {
        success: false,
        msg: 'No Party found!',
        data: ''
      };
      res.status(500).send(error);
      return;
    }

    var success = {
      success: true,
      msg: 'User Parties Found!',
      data: getParties
    };
    res.send(success);
    return;
  } catch (err) {
    return { success: false, error: err, data: null };
  }
})

module.exports = app;
