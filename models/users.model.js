var mongoose = require('mongoose');

var Users = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true
    },
    designation:{
        type:String,
        required:true,
        enum:['Pilot','Flight Attendant','Mechanic']
    },
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('Users', Users);