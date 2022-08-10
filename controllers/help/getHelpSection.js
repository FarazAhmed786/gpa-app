
//***** Modules goes here *****//
const express = require('express');
const { HelpData } = require('../../Models/help.model');

const app = express();

app.get('/', async (req, res) => {
    const allHelp = await getAllHelp()

    var success = {
        success: true,
        msg: 'Help Found',
        data: allHelp
      };
      res.send(success);
})

async function getAllHelp() {
    const allPlaces = await HelpData.find();
    console.log("getAllHelp -> allPlaces", allPlaces)
    return allPlaces
}

module.exports = app;
