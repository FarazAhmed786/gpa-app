
//***** Modules goes here *****//
const express = require('express');
const { HelpContent } = require('../../Models/help.model');
const Joi = require('joi');


const app = express();

app.get('/', async (req, res) => {
console.log("req", req)
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

    const allHelp = await getAllHelp(req.query.cardID)

    var success = {
        success: true,
        msg: 'Help Found',
        data: allHelp
      };
      res.send(success);
})

async function getAllHelp(cardID) {
    const allPlaces = await HelpContent.find({cardID});
    console.log("getAllHelp -> allPlaces", allPlaces)
    return allPlaces
}

function validateApiData(req) {
    const schema = Joi.object().keys({
        cardID: Joi.string().required(),
    });
    return Joi.validate(req, schema)
}

module.exports = app;
