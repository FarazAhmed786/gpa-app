//***** Modules goes here *****//
var _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const express = require('express');
const Joi = require('joi');
var _ = require("lodash");
const { placeData } = require('../../Models/places.model');
const { yourplaceData } = require('../../Models/yourPlace.model');
const auth = require('../../middleware/auth');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express();
//***** ///// *****//

//***** Post Request for Login *****//
app.get('/', auth, async(req, res)=> {
 const MyPlace = await getPlaceByUser(req);

let work = MyPlace.work;
let Home = MyPlace.home;

let fav = MyPlace.fav;   
let HomePlace = await findHome(Home);
let WorkPlace = await findWork(work);
 let favPlaces= await getAllPlaces(fav);
let obj = {Fav:favPlaces,Home:HomePlace,Work:WorkPlace}
 var success = {
    success:true,
    msg:'Places Found',
    data:obj
};
res.send(success);

});
 
//***** ///// *****//
async function getPlaceByUser(body) {
    const myPlace = await yourplaceData
      .findOne({ _userId: body.user._id })
      
    return myPlace;
  }
  async function findWork(body){
    const place = await placeData.findById(body)
    return place
  }
  async function findHome(body){
    const place = await placeData.findById(body)
    return place
  }
  async function getAllPlaces(body) {
    const allPlaces = await placeData.find({
      _id: {
        $in: body
      }
    });
    return allPlaces;
  }

module.exports = app;