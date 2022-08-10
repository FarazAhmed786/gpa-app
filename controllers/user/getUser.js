//***** Modules goes here *****//
var _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const express = require('express');
const Joi = require('joi');
const { UserData } = require('../../Models/user.model');
const auth = require('../../middleware/auth');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express();
//***** ///// *****//

//***** Post Request for Login *****//
app.get('/', auth, async(req, res)=> {
    const url = req.protocol + '://' + req.get('host');
    const user = await UserData.findById(req.user._id).select('-password');
    if(!user) {
        var errors = {
            success:false,
            msg:'Invalid user Id.', 
            data:''
        };
        res.send(errors);
    }
    else {
        var checkProfile =user.profile_img.slice(0,user.profile_img.indexOf("/public"))
        if(checkProfile == 'host'){
            user.profile_img = user.profile_img.slice(user.profile_img.indexOf("public")-1, user.profile_img.length);
            user.profile_img = `${url}${user.profile_img}`
        }
  
        var success = {
            success:true,
            msg:'User Found',
            data:user
        };
        res.send(success);
    }
});
//***** ///// *****//

module.exports = app;