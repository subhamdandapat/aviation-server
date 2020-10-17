var mongoose = require('mongoose');

var Pilots = new mongoose.Schema({
    user_id: {
        type: String,
        ref: 'Users'
    },
    home_icao: {
        type: String
    },
    alternate_icao: {
        type: String
    },
    license_type: {
        type: String,
        enum: ["ATP", "Commercial", "IFR/instrument", "Private", "Multi Engine"]
    },
    aircraft_manufacturer: {
        type: String
    },
    type_rating: {
        type: String
    },
    add_on: {
        type: String
    },
    pic_total_time: {
        type: String
    },
    pic_jet_time: {
        type: String
    },
    sic_total_time: {
        type: String
    },
    rotor_time: {
        type: String
    },
    glider_time: {
        type: String
    },
    last_sim_recurrent: {
        type: String
    },
    training_center: {
        type: String
    },
    sim_discount_notification: {
        type: String,
        enum: ["Yes", "No"]
    },
    contract_pilot: {
        type: String,
        enum: ["Yes", "No"]
    },
    activities: {
        type: String
    },
    profile_picture: {
        type:String
    }
});

Pilots.pre('findOne', function (next) {
    this.populate('user_id');
    next();
});
Pilots.pre('find', function (next) {
    this.populate('user_id');
    next();
});

module.exports = mongoose.model('Pilots', Pilots);