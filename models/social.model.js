var mongoose = require('mongoose');

var Social = new mongoose.Schema({
    user_id: {
        type: String,
        ref: 'Users'
    },
    background_image: {
        type: mongoose.Schema.ObjectId,
        ref: 'Image'
    },
    rating:
        {
            type: String
         },
    about_me:
        { 
            type: String 
        },
    joined_date:
        {
             type: Date 
            },
    following:
     { 
         type: String
         },
    review: 
    { 
        type: String
     },
    posts: [{
        type: String
    }],
    groups: [{
        type: String
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