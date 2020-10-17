const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const comment = new Schema({
    userid: {
        type: Schema.ObjectId,
        required: true,
        ref: "Users"
    },
    profileId: {
        type: String
    },
    designation: {
        type: String
    },
    postId:{
        type:Schema.ObjectId,
        ref:"Post"
    },
    text: {
        type: String
    },
    image: {
        type:String
    },
    profile_picture:{
        type:String
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
})
comment.pre('findOne', function (next) {
    this.populate('userid');
    next();
});
comment.pre('find', function (next) {
    this.populate('userid');
    next();
});

module.exports = mongoose.model("Comment", comment)