//***** Modules goes here *****//
var _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const express = require('express');
const Joi = require('joi');
var _ = require("lodash");
const { placeData } = require('../../Models/places.model');
const { visitplaceData } = require('../../Models/visitPlaces.model');
const auth = require('../../middleware/auth');
var mongoose = require('mongoose');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express();
//***** ///// *****//

//***** Post Request for Login *****//
app.get('/', auth, async (req, res) => {
  const MyPlace = await getPlaceByUser(req);
  //  let placeId = _.map(MyPlace, "_placeId");
  //  let allPlaces= await getAllPlaces(placeId);

  //  var success = {
  //     success:true,
  //     msg:'Places Found',
  //     data:allPlaces
  // };
  var success = {
    success: true,
    msg: 'Places Found',
    data: MyPlace
  };
  res.send(success);

});

//***** ///// *****//
async function getPlaceByUser(body) {
  console.log(body.user._id)
  const myPlace = await visitplaceData
    .find()
    .and([{ _userId: body.user._id }])
    .sort({ visitingNo: -1 });
    var _Userid = mongoose.mongo.ObjectId(body.user._id);
    console.log(_Userid,typeof(_Userid))
  const palace = placeData.aggregate([
    {
     
      $lookup:{
        from: "visitplaces",
        // localField: "_id",
        // foreignField: "_placeId",
        let :  {
          "placeId" : "$_id"
      },
        pipeline : [
          { $sort: { visitingNo : -1 } },
          {
              $match : {
                  $expr : {
                      $and : [
                        // {$eq: [ "$_placeId", "$$placeId" ]},
                        // {"_userId": 0}
                      ]
                  }
              }
          },
      ],

        as: "places"
      }
    }
  ])
  
  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",palace)
  return palace;
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