var mongoose = require('mongoose');

var Attendant = new mongoose.Schema({
    user_id: {
        type: String,
        ref: 'Users'
    },
    license_type: {
        type: String
    },
    add_on: {
        type: String
    },
    experience: {
        type: String
    },
    visa_status: {
        type: String,
        enum: ["Yes", "No"]
    },
    passport: {
        type: String,
        enum: ["Yes", "No"]
    },
    passport_issuing_country: {
        type: String
    },
    smoke: {
        type: String,
        enum: ["Yes", "No"]
    },
    prepare_food: {
        type: String,
        enum: ["Yes", "No"]
    },
    profile_picture: {
        type: mongoose.Schema.ObjectId,
        ref: 'Image'
    }
});

Attendant.pre('findOne', function (next) {
    this.populate('user_id');
    next();
});
Attendant.pre('find', function (next) {
    this.populate('user_id');
    next();
});

module.exports = mongoose.model('Attendant', Attendant);