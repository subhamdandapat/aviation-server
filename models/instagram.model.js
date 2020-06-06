const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Instagram = Schema({
    embedded_html: {
        type: String
    },
    created_at: {
        type: String,
        date: new Date()
    }
})

module.exports = mongoose.model('Instagram', Instagram);