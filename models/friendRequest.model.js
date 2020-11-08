const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const friendRequest = new Schema({
    senderProfileId: {
        type: String
    },
    senderDesignation: {
        type: String
    },
    senderName: {
        type: String
    },
    receiverProfileId:{
        type:String
    },
    receiverDesignation: {
        type: String
    },
    receiverName: {
        type: String
    },
    status: {
        type: String,
        enum: ["Sent","Received","Accept", "Reject",'"Revoke']
    },
    senderProfile_picture: {
        type:String
    },
    receiverProfile_picture: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
updatedDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("FriendRequest", friendRequest)