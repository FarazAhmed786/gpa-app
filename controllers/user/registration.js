//***** Modules goes here *****//
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const express = require('express');
const Joi = require('joi');
const {UserData, generateAuthToken} = require('../../Models/user.model');
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express();
//***** ///// *****//

//***** Post Request for Signup *****//
app.post('/', async (req, res)=> {
    const { error } = validateUserData(req.body);
    console.log(error)
    if(error) {
        var errors = {
            success:false,
            msg:error.name, 
            data:error.details[0].message
        };
        res.send(errors);
        return;
    }

    const alreadyExist = await UserData.find({ $or: [{ email: req.body.email }, { mobile: req.body.mobile }] });

    if (alreadyExist.length > 0) {
      res.send({
        data: null,
        success: false,
        msg: "Email OR phone already exists"
      })
      return;
    }

    createUser(req.body).then (
        (response)=> {
            if(response == 500) {
                var errors = {
                    success:false,
                    msg:'Duplicate', 
                    data:'Email already exist'
                };
                res.send(errors);
                return;
            }
            const requestData = {
                success: true,
                msg: 'User created successfully.',
                data: _.pick(req.body, ['_id', 'lastName', 'mobile', 'firstName', 'email', 'createdDate'])
            }
            res.send(requestData);
        }
    );
});
//***** ///// *****//

//***** User signup data validation function *****//
function validateUserData(userData) {
    const schema = Joi.object().keys({
        firstName: Joi.string().min(4).max(30).required(),
        lastName: Joi.string().min(4).max(30).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        mobile: Joi.number().required(),
        password: Joi.string().min(5),
        termsAgreed: Joi.boolean().invalid(false).required(),
        gcm_id: Joi.string(),
        platform: Joi.string()
    });
    return Joi.validate(userData, schema);
}
//***** ///// *****//

//***** Initialing and saving data *****//
async function createUser(userData) {
    // return new Promise((res)=> {
    userData.profile_img = 'http://res.cloudinary.com/itsolution24x7/image/upload/v1612875127/partyImage/yrsdbs3ki7oyiuuwklbx.png';
    userData.login_type = 0;
    const user = new UserData(userData);
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(user.password, salt);
    user.password = hashed;
    
    try{
        const result = await user.save();
    }
    catch(ex) {
        console.log('catch');
        console.log(ex.code);
        return (500);
    }
    return (200);
    // });
}
//***** ///// *****//

module.exports = app;