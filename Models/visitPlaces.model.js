
const mongoose = require('mongoose');



const VisitplaceSchema = new mongoose.Schema({
    _userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, ref: 'User' 
      },
      _placeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, ref: 'place' 
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

const visitplaceData = mongoose.model('visitPlaces', VisitplaceSchema);


exports.visitplaceData =  visitplaceData;