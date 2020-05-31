var mongoose = require('mongoose');

var Mechanic = new mongoose.Schema({
    user_id: {
        type: String,
        ref: 'Users'
    },
    home_icao: {
        type: String
    },
    license_type: {
        type: String,
        enum: ["RepairMan", "Engineer", "Avionics Technician", "Airframe", "Powerplant", "Inspector", "ATP", "FCC License", ""]
    },
    add_on: {
        type: String
    },
    travel_for_aog: {
        type: String,
        enum: ["Yes", "No"]
    },
    own_tools: {
        type: String,
        enum: ["Yes", "No"]
    },
    discount_training: {
        type: String,
        enum: ["Yes", "No"]
    },
    contract: {
        type: String,
        enum: ["Yes", "No"]
    },
    fellowship: {
        type: String,
        enum: ["Yes", "No"]
    },
    airframe: {
        type: String
    },
    profile_picture: {
        type: mongoose.Schema.ObjectId,
        ref: 'Image'
    }
});

module.exports = mongoose.model('Mechanic', Mechanic);