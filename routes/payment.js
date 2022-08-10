//***** Modules goes here *****//
const express = require('express');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express.Router();
//***** ///// *****//

//***** Distributing requests *****//

//~~ Get Payment ~~//
const getPayment = require('../controllers/payment/get');
app.use('/get', getPayment);

//~~ Execute Payment ~~//
const execute = require('../controllers/payment/execute');
app.use('/execute', execute);

//~~ Execute Payment ~~//
const verify = require('../controllers/payment/verify');
app.use('/verify', verify);

module.exports = app;