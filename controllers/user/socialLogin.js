//***** Modules goes here *****//
var _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const express = require('express');
const Joi = require('joi');
const { UserData, generateAuthToken } = require('../../Models/user.model');
const { SocialUserData } = require('../../Models/socialUser.model');
const { use } = require('./registration');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express();
//***** ///// *****//

//***** Post Request for Login *****//
app.post('/', (req, res) => {
    //console.log("farz",req.body);
    const url = req.protocol + '://' + req.get('host');
    const { error } = validateUserData(req.body);
    
    if (error) {
        var errors = {
            success: false,
            msg: error.name,
            data: error.details[0].message
        };
        res.send(errors);
        return;
    }
    // res.send({success:true})
    checkUser(req.body).then((response) => {
        if (response == null) {
            var errors = {
                success: false,
                msg: 'Invalid email or password.',
                data: ''
            };
            res.send(errors);
        }
        else if (response == 700) {
            var errors = {
                success: false,
                msg: 'phone number not required',
                errorcode: 700
            };
            res.send(errors);
        }
        else {
            
            var data = _.pick(response, ['_id', 'firstName', 'mobile', 'lastName', 'liked_stores', 'email', 'profile_img', 'createdDate', 'access_token']);
            // data.profile_img =`${url}${data.profile_img}`
            var success = {
                success: true,
                msg: 'User Found',
                data: data
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
        platform: Joi.string(),
        firstName: Joi.string(),
        lastName: Joi,
        profile_img: Joi.string(),
        idToken: Joi.string(),
        authCode: Joi.string(),
        Accounttype: Joi.number().required(),
        mobile: Joi.number(),
        termsAgreed: Joi.boolean()
    });
    return Joi.validate(userData, schema);
}
//***** ///// *****//

async function checkUser(body) {
    const user = await UserData.findOne({ email: body.email });
    
    // For new user case
    if (!user) {
        if(!body.mobile){
            return (700);
        }
        var data = { termsAgreed: body.termsAgreed, mobile: body.mobile, email: body.email, Accounttype: body.Accounttype, gcm_id: body.gcm_id, profile_img: body.profile_img, platform: body.platform, firstName: body.firstName, lastName: body.lastName }
        const userForSve = new UserData(data);
        console.log("idhar",userForSve);
        try {
            const Userresult = await userForSve.save();
            body._userId = Userresult._id;

        }
        catch (ex) {
            console.log('catch1', ex);
           console.log("yhaaya");
            console.log(ex.code);
            return (500);
        }
        try {
            
            const SavesocialUser = new SocialUserData(body);
            const Socialresult = await SavesocialUser.save();

        }
        catch (err) {
            console.log('catch2', err);
            console.log(err.code);
            return (500);
        }
        const user1 = await UserData.findOne({ email: body.email });
        return user1;
    }

    //For user exist 
    const Socialuser = await SocialUserData.findOne({ email: body.email });

    
    if (user.Accounttype && user.Accounttype != 0) {
        
        if (!Socialuser) {
            try {
                body._userId = user._id;
                const SavesocialUser = new SocialUserData(body);
                const result = await SavesocialUser.save();
                
            }
            catch (ex) {
                console.log('catch');
                console.log(ex);
                return (500);
            }
            
        }

        user.access_token = generateAuthToken(user._id);

        if (user) {
            const result = await UserData.updateOne(
                { _id: user._id },
                {
                    $set: {
                        gcm_id: body.gcm_id,
                        platform: body.platform,
                        Accounttype:body.Accounttype
                    }
                }
            );
            const Socialresult = await SocialUserData.updateOne(
                { _userId : user._id },
                {
                    $set: {
                        gcm_id: body.gcm_id,
                        platform: body.platform,
                        Accounttype:body.Accounttype
                    }
                }
            );
        }

        return user;
    }
}
    module.exports = app;