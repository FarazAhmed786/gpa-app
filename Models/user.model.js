
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');


const userSchema = new mongoose.Schema({
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
    mobile: {
        type: Number,
        unique: true,
        required: true
    },
    termsAgreed: {
        type: Boolean,
        required: true
    },
    password: {
        type: String,
        required: false,
        // select:false
    },
    Accounttype: {
        type: Number
    },
    bio:String,
    profile_img: { type:String},
    gcm_id: String,
    platform: String,
    createdDate:{ type:Date, default:Date.now },
});
function generateAuthToken(_id) {
    const token = jwt.sign({_id: _id}, config.get('jwtPrivateKey'));
    return token;
}
const UserData = mongoose.model('users', userSchema);


exports.UserData = UserData;
exports.generateAuthToken = generateAuthToken;