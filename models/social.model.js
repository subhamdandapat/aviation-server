var mongoose = require('mongoose');

var Social = new mongoose.Schema({
    user_id: {
        type: String,
        ref: 'Users'
    },
    background_image: {
        type: String
    },
    about_me:
    {
        type: String
    },
    nickname: {
        type: String
    },
    logo: {
        type: String
    },
    joined_date:
    {
        type: Date
    },
    following:
        [{
            profileId: { type: String },
            designation: { type: String },
            name: { type: String },
            profile_picture: { type: String }
        }],
    followers: [{

        profileId: { type: String },
        designation: { type: String },
        name: { type: String },
        profile_picture: { type: String }
    }],

    posts: [{
        type: String
    }],
    groups: [{

        type: mongoose.Schema.ObjectId,
        ref: 'Groups'
    }],
    friendRequests: [{

        type: mongoose.Schema.ObjectId,
        ref: 'FriendRequest'
    }],
    avg_rating: {
        type: Number
    },
    rating_reviews: [{
        rating: { type: Number, default: 0 },
        review: { type: String },
        name: { type: String },
        userId: { type: String },
        profileId: { type: String },
        designation: { type: String }
    }]
});

Social.pre('findOne', function (next) {
    this.populate('user_id');
    next();
});
Social.pre('find', function (next) {
    this.populate('user_id');
    next();
});

module.exports = mongoose.model('Social', Social);