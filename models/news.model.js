const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const news = new Schema({
    headline: {
        type: String,
        required:true
    },
    article: {
        type: String,
        required:true
    },
    image: [{
        type:String
    }],
    createdDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("news", news)