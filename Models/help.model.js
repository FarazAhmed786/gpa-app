
const mongoose = require('mongoose');

const helpSchema = new mongoose.Schema({
      title:{
        type:String
      },
      subTitle:{
        type:String
      },
      image:{
          type:String,
      },
    createdDate:{ type:Date, default:Date.now },
});

const helpContentSchema = new mongoose.Schema({
  title:{
    type:String
  },
  subTitle:{
    type:String
  },
  image:{
      type:String
  },
  video: {
      type:String
  },
  description:{
      type:String
  },
  cardID:{
    type:String
},
type:{
  type:String
},
  createdDate:{ type:Date, default:Date.now },
});

const HelpContent = mongoose.model('helpContent', helpContentSchema);
const HelpData = mongoose.model('help', helpSchema);

exports.HelpContent = HelpContent;
exports.HelpData = HelpData;