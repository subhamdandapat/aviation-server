const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Instagram = Schema({
    embedded_html: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Instagram', Instagram);