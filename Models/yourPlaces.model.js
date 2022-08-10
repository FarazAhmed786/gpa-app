
const mongoose = require('mongoose');



const YourplaceSchema = new mongoose.Schema({
    _userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, ref: 'User' 
      },
      _placeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, ref: 'place' 
      },
    title: {
        type: String,
        min: 4,
        max: 30,
        required: true
    },
   visitingNo:{
      type:Number,
      default:0
  },
  lastUpdate:{
    type:Date
  },
    createdDate:{ type:Date, default:Date.now },
});

const yourplaceData = mongoose.model('yourPlaces', YourplaceSchema);


exports.yourplaceData =  yourplaceData;