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
        type: mongoose.Schema.ObjectId,
        ref: 'Social'
    },
    image: [
        { type: String }
    ],
    video: [{
        type: String
        
    }],
    text:
    {
        type: String
    },
    location: {
        type: String
    },
    likes: [{
        profileId: {
            type: String
        },
        designation: {
            type: String
        }

    }],
    comments: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    }],
    taggedUsers: [],
    profile_picture: {
        type: String
    },
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
Post.pre('findOne', function (next) {
    this.populate('comments');
    next();
});
Post.pre('find', function (next) {
    this.populate('comments');
    next();
});


module.exports = mongoose.model('Post', Post); 