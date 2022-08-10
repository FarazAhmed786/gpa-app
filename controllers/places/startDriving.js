//***** Modules goes here *****//
const bcrypt = require('bcryptjs');
const express = require('express');
const Joi = require('joi');
const { UserData } = require('../../Models/user.model');
const { placeData } = require('../../Models/places.model');
const { visitplaceData } = require('../../Models/visitPlaces.model');

const multer = require("multer");
const auth = require('../../middleware/auth');

const app = express();
//***** ///// *****//



//***** Post Request for Login *****//
app.post('/', auth, (req, res) => {

    const { error } = validateApiData(req.body);

    if (error) {
        var errors = {
            success: false,
            msg: error.name,
            data: error.details[0].message
        };
        res.status(403).send(response);
        return;
    }
    checkUplocation(req.body.uplocation)
        .then((response) => {
            if (response.success === false) {
                res.status(403).send(response);
                return;
            }
            createPlace(response).then(result => {
                // var myPlaceData = { _userId: req.user._id, _placeId: result._id }
                // createMyplace(myPlaceData).then((re) => { }).catch(err => { })
            }).catch(err => {

            })

        })
        .catch(err => {
            res.status(404).send(err);
            return;
        })
    checkdownlocation(req.body.downlocation)
        .then((response) => {
            if (response.success === false) {
                res.status(403).send(response);
                return;
            }
            createPlace(response).then(result => {
                var myPlaceData = { _userId: req.user._id, _placeId: result._id }
                createMyplace(myPlaceData).then((re) => { }).catch(err => { })
            }).catch(err => {

            })
        })
        .catch(err => {
            res.status(404).send(err);
            return;
        })
    res.status(200).send(
        {
            success: true,
            msg: 'Drive Start',
            data: req.body
        }
    )

});
//***** ///// *****//

//***** User login data validation function *****//
function validatePlace(placeData) {
    const schema = Joi.object().keys({
        title: Joi.string().min(4).max(1000).required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        googlePlaceId:Joi.string().required(),
    });
    return Joi.validate(placeData, schema);
}
function validateApiData(req) {
    const schema = Joi.object().keys({
        uplocation: Joi.object().required(),
        downlocation: Joi.object().required(),
    });
    return Joi.validate(req, schema)
}
//***** ///// *****//

//***** Find User and return function *****//
async function checkUplocation(body) {
    const { error } = validatePlace(body);
    console.log(error)
    if (error) {
        var errors = {
            success: false,
            msg: "In Uplocation " + error.name,
            data: error.details[0].message
        };
        return errors;
    }
    var data = { title: body.title, location: [body.latitude, body.longitude], googlePlaceId:body.googlePlaceId }
    return data;
}
async function createPlace(body) {
    var findResult;
    const place = new placeData(body);
    const findPlace = await placeData.findOne({ location: body.location,googlePlaceId:body.googlePlaceId });
    if(findPlace){
        return findPlace;
    }
    try {
        const result = await place.save();

        findResult = result;
    }
    catch (ex) {

        findResult = findPlace;
    }
    return findResult;
}
async function createMyplace(body) {
    const findPlace = await visitplaceData.findOne({ _userId: body._userId,_placeId:body._placeId });
    if(findPlace){
        console.log(findPlace,"aaaaaaaaaaaaaaaaaaaaaaaaa")
        var bod = {
            lastUpdate: new Date(),
            visitingNo: findPlace.visitingNo+1
            }
         await visitplaceData.updateOne(
           {"_id" :findPlace._id} ,
            { $set: bod},function (err){
                console.log("Errrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",err)
            }    
        )
        return (300) 
    }
    else{
        const place = new visitplaceData(body);
        try {
            const result = await place.save();
    
        }
        catch (ex) {
            return (500);
        }
        return (200);
    }

}
async function checkdownlocation(body) {
    const { error } = validatePlace(body);
    console.log(error)
    if (error) {
        var errors = {
            success: false,
            msg: "In downlocation " + error.name,
            data: error.details[0].message
        };
        return errors;
    }
    var data = { title: body.title, location: [body.latitude, body.longitude], googlePlaceId:body.googlePlaceId }
    return data;
}
//***** ///// *****//

module.exports = app;