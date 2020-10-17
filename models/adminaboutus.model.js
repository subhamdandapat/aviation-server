const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const aboutus = new Schema({
    text: {
        type: String
    },
    image: [{
        type:String
    }],
    createdDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("AboutUs", aboutus)