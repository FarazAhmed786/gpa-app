//***** Modules goes here *****//
var _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const express = require('express');
const Joi = require('joi');
const {UserData, generateAuthToken} = require('../../Models/user.model');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express();
//***** ///// *****//

//***** Post Request for Login *****//
app.post('/', (req, res)=> {
    const url = req.protocol + '://' + req.get('host');
    const { error } = validateUserData(req.body);
    if(error) {
        var errors = {
            success:false,
            msg:error.name, 
            data:error.details[0].message
        };
        res.status(400).send(errors);
        return;
    }
    
    checkUser(req.body).then((response)=> {
        if(response == null) {
            var errors = {
                success:false,
                msg:'Invalid email or password.', 
                data:''
            };
            res.status(400).send(errors);
        }
        else {
            var data = _.pick(response, ['_id', 'firstName','lastName', 'mobile', 'liked_stores', 'email','profile_img', 'createdDate', 'access_token', 'bio']);
            data.profile_img =`${data.profile_img}`
            var success = {
                success:true,
                msg:'User Found',
                data:data
            };
            res.send(success);
        }
    });
});
//***** ///// *****//

//***** User login data validation function *****//
function validateUserData(userData) {
    const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(5),
        gcm_id: Joi.string(),
        platform: Joi.string()
    });
    return Joi.validate(userData, schema);
}
//***** ///// *****//

async function checkUser(body) {
    const user = await UserData.findOne({email:body.email});
    console.log(user)
    if(!user) return null;
    
    const validPassword = await bcrypt.compare(body.password, user.password);
    if(!validPassword) return null;
    
    user.access_token = generateAuthToken(user._id);
    
    if(user) {
        const result = await UserData.updateOne(
            { _id: user._id },
            { $set: {
                    gcm_id: body.gcm_id,
                    platform: body.platform
                }
            }    
        );
    }
    
    return user;
}

module.exports = app;