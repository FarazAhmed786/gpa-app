//***** Modules goes here *****//
const express = require('express');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express.Router();
//***** ///// *****//

//***** Distributing requests *****//

//~~ Start Driving ~~//
const helpSection = require('../controllers/help/addHelpSection');
const getHelpSection = require('../controllers/help/getHelpSection');
const addHelpContent = require('../controllers/help/createContent');
const getHelpContent = require('../controllers/help/getContent');
app.use('/create-section', helpSection);
app.use('/get-section', getHelpSection);
app.use('/create-section-content', addHelpContent);
app.use('/get-section-content', getHelpContent);


module.exports = app;