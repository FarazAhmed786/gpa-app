//***** Modules goes here *****//
const express = require('express');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express.Router();
//***** ///// *****//

//***** Distributing requests *****//

//~~ Start Driving ~~//
const startdriving = require('../controllers/places/startDriving');
app.use('/start-driving', startdriving);

// ~~ Add places ~~//
const addPlaces = require('../controllers/places/addplaces');
app.use('/add', addPlaces);
// //***** ///// *****//

// //~~ Suggested places ~~//
// const Suggestions = require('../controllers/places/suggestion');
// app.use('/suggestions', Suggestions);
// //***** ///// *****//

// //~~ Delete Places ~~//
// const Delete = require('../controllers/places/deletePlaces');
// app.use('/delete', Delete);
// //***** ///// *****//

// //~~ Get user places ~~//
const getPlaces = require('../controllers/places/getplace');
app.use('/getplaces', getPlaces);

const getMyPlaces = require('../controllers/places/getMyplaces');
app.use('/getmyplaces', getMyPlaces);
// const editPlaces = require('../controllers/places/editplace');
// app.use('/editplace', editPlaces);
//***** ///// *****//
module.exports = app;