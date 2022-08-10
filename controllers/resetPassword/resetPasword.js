//***** Modules goes here *****//
var _ = require('lodash');

const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { UserData } = require('../../Models/user.model');


var flash = require('express-flash');//***** Express Router to export in module *****//
const app = express();
//***** ///// *****//


app.post('/', function (req, res, next) {
    const userdata = new UserData();
    updatePassword(req.body).then(async(response)=>{
        if(response){
            const {error} = validateUserpassword({password:req.body.password});
            if(error){
                console.log("password",error)
                res.send({success:false,msg:"Enter correct password"});
            }
            else{
                // console.log(response.)
                const userdata = new UserData(response);
                console.log("hello",userdata);
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.password, salt);
                const result = await userdata.updateOne({$set:{password:hashed}});
                console.log(result);
                if(result){
                    res.send({success:true,msg:'password updated' , res:result});
                }
                else{
                    res.send({success:false,msg:"something went wrong"});
                }
            }
        }
        else{
            res.send({success:false,msg:"error"});
        }
    });
   
});
async function updatePassword(body){
    const userdata = new UserData();
    var result = await UserData.findById(body.userId);
    console.log(result.password)
    if(result){
        return result;
    } 
    else {
        return result;
    }
}
function validateUserpassword(userData) {
    const schema = Joi.object().keys({
        password: Joi.string().min(5),
    });
    return Joi.validate(userData, schema);
}
module.exports = app;