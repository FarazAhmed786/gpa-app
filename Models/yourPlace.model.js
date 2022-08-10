
const mongoose = require('mongoose');



const YourplaceSchema = new mongoose.Schema({
    _userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, ref: 'User' 
      },
    work: {
        type: String,
        default:null
    },
    home:{
        type: String,
        default:null
    },
    fav:{
        type:[String],
        default:[]
    },
   
  lastUpdate:{
    type:Date
  },
    createdDate:{ type:Date, default:Date.now },
});

const yourplaceData = mongoose.model('yourPlaces', YourplaceSchema);


exports.yourplaceData =  yourplaceData;