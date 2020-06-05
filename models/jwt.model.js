const mongoose = require('mongoose');
const JWT = mongoose.Schema({
    token: {
        type: String
    },
    userId: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum:['Pilot','Flight Attendant','Mechanic']
    },
    IPAddress: {
        type: String
    },
    platform: {
        type: String
    },
    createdAt: {
        type: String,
        default: new Date()
    }
})
module.exports = mongoose.model('JWT', JWT);