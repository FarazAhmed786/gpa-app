//***** Modules goes here *****//
const bcrypt = require('bcryptjs');
const express = require('express');
const Joi = require('joi');
const { placeData } = require('../../Models/places.model');
const { yourplaceData } = require('../../Models/yourPlace.model');
var _ = require("lodash");
const auth = require('../../middleware/auth');

const app = express();
//***** ///// *****//



//***** Post Request for Login *****//
app.post('/', auth, async (req, res) => {
console.log("req==========================", req)
    console.log(req.user._id)
    const { error } = validateData(req.body);

    if (error) {
        var errors = {
            success: false,
            msg: error.name,
            data: error.details[0].message
        };
        res.status(403).send(errors);
        return;
    }
    var data = { title: req.body.title, location: [req.body.latitude, req.body.longitude], googlePlaceId: req.body.googlePlaceId }
    let place = await createPlace(data)
    let placeData = { _userId: req.user._id, _placeId: place._id }
    if (req.body.Mytitle == "WORK") {
        let addwork = await createWork(placeData)
        console.log(addwork)
        if(addwork == 200){
            var status = {
                success:true,
                msg:"data updated",
                data:place
            }
            res.status(200).send(status)
            return;
        }
        else{
            var status = {
                success:false,
                msg:"Error While updating",
                data:null
            }
            res.status(404).send(status)
            return; 
        }
    }

    if (req.body.Mytitle == "HOME") {
        let addHome = await createHome(placeData)
        if(addHome == 200){
            var status = {
                success:true,
                msg:"data updated",
                data:place
            }
            res.status(200).send(status)
            return;
        }
        else{
            var status = {
                success:false,
                msg:"Error While updating",
                data:null
            }
            res.status(404).send(status)
            return; 
        }
    }
    if (req.body.Mytitle == "FAV") {
        let addFav = await createFavurite(placeData)
        if(addFav == 200){
            var status = {
                success:true,
                msg:"data updated",
                data:place
            }
            res.status(200).send(status)
            return;
        }
       else if(addFav == 100){
            var status = {
                success:false,
                msg:"Place Already Exsist In Favourite",
                data:null
            }
            res.status(404).send(status)
            return;
        }
        else{
            var status = {
                success:false,
                msg:"Error While updating",
                data:null
            }
            res.status(404).send(status)
            return; 
        }
    }
    // res.send({ status: true, data: place })



});
//***** ///// *****//

//***** User login data validation function *****//

function validateData(req) {
    const schema = Joi.object().keys({
        title: Joi.string().required(),
        Mytitle: Joi.string().valid(['HOME', 'WORK', "FAV"]).required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        googlePlaceId: Joi.string().required(),

    });
    return Joi.validate(req, schema)
}
//***** ///// *****//

//***** Find User and return function *****//

async function createPlace(body) {
    var findResult;
    const findPlace = await placeData.findOne({ location: body.location, googlePlaceId: body.googlePlaceId });
    if (findPlace) {
        console.log(findPlace, "dinddddddd")
        return findPlace
    }
    const place = new placeData(body);
    try {
        const result = await place.save();
        console.log(result, "Result")
        findResult = result;
    }
    catch (ex) {
        // const findPlace = await placeData.findOne({ location: body.location,googlePlaceId:body.googlePlaceId });
        findResult = findPlace;
    }
    return findResult;
}
async function createWork(body) {
    const findPlace = await yourplaceData.findOne({ _userId: body._userId });
    var data = { _userId: body._userId, work: body._placeId }
    if (!findPlace) {
        const place = new yourplaceData(data);
        try {
            const result = await place.save();
            return (200)
        }
        catch (ex) {
            return (500);
        }


    }
    else {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        // if (findPlace.work) {
            try {
                const result = await yourplaceData.findOneAndUpdate(
                    { _id: findPlace._id },
                    {
                        $set: { work: body._placeId }
                    });
                    
                return (200)
            }
            catch (err) {
                console.log(err,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                return (500)
            }
        // }
    }

    // return (200);
}
async function createHome(body) {
    const findPlace = await yourplaceData.findOne({ _userId: body._userId });
    var data = { _userId: body._userId, home: body._placeId }
    if (!findPlace) {
        const place = new yourplaceData(data);
        try {
            const result = await place.save();
            return (200)
        }
        catch (ex) {
            return (500);
        }


    }
    else {
        // if (findPlace.home) {
            try {
                const result = await yourplaceData.findOneAndUpdate(
                    { _id: findPlace._id },
                    {
                        $set: { home: body._placeId }
                    });
                return (200)
            }
            catch (err) {
                return (500)
            }
        // }
    }

}

async function createFavurite(body) {
    console.log(body)
    const findPlace = await yourplaceData.findOne({ _userId: body._userId });
    var placeArray = [];
    placeArray.push(body._placeId)
    var data = { _userId: body._userId, fav: placeArray }
    if (!findPlace) {
        const place = new yourplaceData(data);
        try {
            const result = await place.save();
            console.log(result)
            return (200)
        }
        catch (ex) {
            return (500);
        }


    }
    else {
        // if (findPlace.fav && findPlace.fav.length > 0) {
            var array = findPlace.fav;
            // const arrayResult = array.find(JSON.stringify(body._placeId))
         let arrayResult = _.map(array, function(o) {
            if (o == body._placeId) 
            return o;
        });
        arrayResult = _.without(arrayResult, undefined)
        console.log(arrayResult,"aaaaaaaaaaaaaaaaaaaaaaaaaa")
      if(arrayResult.length > 0){
          return (100)
      }
      else {
          array.push(body._placeId)
            try {
                const result = await yourplaceData.findOneAndUpdate(
                    { _id: findPlace._id },
                    {
                        $set: { fav: array }
                    });
                return (200)
            }
            catch (err) {
                return (500)
            }
        }
    // }
    }
    // const place = new yourplaceData(body);
    // try {
    //     const result = await place.save();

    // }
    // catch (ex) {
    //     return (500);
    // }
    // return (200);
}


//***** ///// *****//

module.exports = app;