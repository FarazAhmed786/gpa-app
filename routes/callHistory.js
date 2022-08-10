//***** Modules goes here *****//
const express = require('express');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express.Router();
//***** ///// *****//

//***** Distributing requests *****//

//~~ Start Driving ~~//
const getCallHistory = require('../controllers/callHistory/getCallHistory');

app.use('/get-call-history', getCallHistory);

const post = require('../controllers/callHistory/postAudio');
app.use('/post', post);

// const get = require('../controllers/callHistory/getAudio');
// app.use('/get', get);

module.exports = app;