var mongoose = require('mongoose');

var Post = new mongoose.Schema({
    user_id: {
        type: String,
        ref: 'Users'
    },
    profileId: {
        type: String
    },
    db_collection: {
        type: String
    },
    socialId: {
        type: String,
        ref: 'Social'
    },
    image: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Image'
    }],
    video: {
        type: mongoose.Schema.ObjectId,
        ref: 'Image'
    },
    text:
    {
        type: String
    },
    likes: [{
        type: String
    }],
    comments: [{
        type: String
    }],
    createdDate: {
        type: Date,
        default: Date.now
    }
});


Post.pre('findOne', function (next) {
    this.populate('user_id');
    next();
});
Post.pre('find', function (next) {
    this.populate('user_id');
    next();
});
module.exports = mongoose.model('Post', Post); 