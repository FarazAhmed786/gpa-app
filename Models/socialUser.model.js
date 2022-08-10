
const mongoose = require('mongoose');



const socialUserSchema = new mongoose.Schema({
    _userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, ref: 'User' 
      },
    firstName: {
        type: String,
        min: 4,
        max: 30,
        required: true
    },
    lastName: {
        type: String,
        max: 30,
        required: false
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
   
   Accounttype:{
    type:Number,
    required:true,
   },
   idToken:{
       type:String,
       unique:true,
       required:true
   },
   authCode:{
       type:String,
       required:true,
   },
    profile_img: { type:String},
    gcm_id: String,
    platform: String,
    createdDate:{ type:Date, default:Date.now },
});

const SocialUserData = mongoose.model('SocialAccounts', socialUserSchema);


exports.SocialUserData =  SocialUserData;