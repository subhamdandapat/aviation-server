const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const notification = new Schema({
    title:{
        type:String
    },
    profileId:{
        type:String
    },
    designation: {
        type: String
    }, 
    profile_picture: {
        type:String
    },
    noti_receiver:[{
        profileId:String,
        designation:String
    }],
    createdDate: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model("notification", notification)