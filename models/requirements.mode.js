const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Requirements = Schema({
    author_id: {
        type: String // reference to foreign table 
    },
    author_role: {
        type: String,
        enum: ['Pilot', 'Flight Attendant', 'Mechanic']
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String
        }
    ],
    for: [
        {
            type: String,
            enum: ['Pilot', 'Flight Attendant', 'Mechanic']
        }
    ],
    type: {
        type: String,
        enum: ['temporary', 'permanent'],
        required: true
    },
    date_from: {
        type: String
    },
    date_to: {
        type: String
    },
    city_from: {
        type: String
    },
    city_to: {
        type: String
    },
    passport_required: {
        type: Boolean,
        default: false
    },
    payment: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed']
    },
    created_at: {
        type: String,
        date: new Date()
    }
});

module.exports = mongoose.model('Requirements', Requirements);