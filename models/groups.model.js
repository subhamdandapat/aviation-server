const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const groups = new Schema({
    // userid: {
    //     type: Schema.ObjectId,
    //     required: true,
    //     ref: "Users"
    // },
    profileId: {
        type: String
    },
    designation: {
        type: String
    },
    name: {
        type: String
    },
    purpose: {
        type: String
    },
    profile_picture: {
        type: String
    },
    cover_picture: {
        type:String
    },
    posts: [{
        type: Schema.ObjectId,
        ref: "Post"
    }],
    members: [{
        name: { type: String },
        userId: { type: String },
        profileId: { type: String },
        designation: { type: String }
    }],
    avg_rating:{
        type:Number
    },
    rating_reviews:[{
        rating:{type:Number,default:0},
        review: {type:String},
        name: { type: String },
        userId: { type: String },
        profileId: { type: String },
        designation: { type: String }
    }],
    createdDate: {
        type: Date,
        default: Date.now
    }
})
// groups.pre('findOne', function (next) {
//     this.populate('userid');
//     next();
// });
// groups.pre('find', function (next) {
//     this.populate('userid');
//     next();
// });

module.exports = mongoose.model("Groups", groups)