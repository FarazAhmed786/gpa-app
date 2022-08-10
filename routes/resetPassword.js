//***** Modules goes here *****//
const express = require('express');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express.Router();
//***** ///// *****//

//***** Distributing requests *****//

//~~ Signup ~~//
const forgetpassword = require('../controllers/resetPassword/forgetPassword');
app.use('/forget', forgetpassword);

//~~ Login ~~//
const otpCode = require('../controllers/resetPassword/otpCode');
app.use('/otpcode', otpCode);
//***** ///// *****//

//~~ Edit Profile ~~//
const resetPassword = require('../controllers/resetPassword/resetPasword');
app.use('/reset', resetPassword);
//***** ///// *****//


//***** ///// *****//
module.exports = app;