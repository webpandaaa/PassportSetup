var mongoose = require('mongoose');

var plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/ankushhh");

var userSchema = mongoose.Schema({
  username:String,  
  password:String,
  email:String,
  number:Number,
  image: {
    type: String,
    default : "default.png"
  },
  like: {
    type : Array,
    default : []
} 
}); 


userSchema.plugin(plm);
module.exports=mongoose.model('user',userSchema);