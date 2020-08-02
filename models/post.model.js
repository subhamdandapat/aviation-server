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
        ref: 'Users'
    },
    image: {
        type: mongoose.Schema.ObjectId,
        ref: 'Image'
    },
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
    }]
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