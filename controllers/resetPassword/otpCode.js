var _ = require('lodash');
const express = require('express');
const { UserData } = require('../../Models/user.model');
const { Token } = require('../../Models/token.user.model');


const app = express();



app.post('/', function (req, res, next) {
    var date = Date.now();
    gettoken(req.body).then(response => {
        // console.log(response)
        if(response.status === 500){
            res.send({success:false,verified:false,msg:"Error"});
        }
        else if(response.status === 200){
            
            
                res.send({success:true,verified:true,msg:"successfull"});
           
            
            
        }
    });
});
async function gettoken(token) {
    var gettoken = await Token
        .find()
        .and([{ _userId: token.userId, token: token.token }]);

    if(gettoken.length > 0){
        var deleteToken =await Token.deleteMany({_userId:token.userId});
           console.log(deleteToken)
        return({status:200,res:gettoken});
    }
    else{
        return({status:500,res:{}});
    }
    // }
    // else{

    // }
}
module.exports = app;