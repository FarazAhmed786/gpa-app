//***** Modules goes here *****//
const express = require('express');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express.Router();
//***** ///// *****//

//***** Distributing requests *****//

//~~ Signup ~~//
const signupModule = require('../controllers/user/registration');
app.use('/register', signupModule);

//~~ Login ~~//
const loginModule = require('../controllers/user/login');
app.use('/login', loginModule);
//***** ///// *****//

//~~ Social Login ~~//
const  SocialloginModule = require('../controllers/user/socialLogin');
app.use('/social-login', SocialloginModule);
//***** ///// *****//

//~~ Edit Profile ~~//
const editModule = require('../controllers/user/editProfile');
app.use('/edit', editModule);
//***** ///// *****//

//~~ Get user Profile ~~//
const getUser = require('../controllers/user/getUser');
app.use('/getUser', getUser);


// get all user
const getAllUser = require('../controllers/user/getAllUser');
app.use('/getAll', getAllUser);
//***** ///// *****//
module.exports = app;