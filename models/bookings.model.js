const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const bookings = new Schema({
    userid: {
        type: Schema.ObjectId,
        required: true,
        ref: "Users"
    },
    bookieid: {
        type: Schema.ObjectId,
        required: true,
        ref: "Users"
    },
    event_status: {
        type: String,
        enum: ["pending", "cancelled", "confirmed"],
        required: true
    },
    event_title: {
        type: String,
        required: true
    },
    event_description: {
        type: String,
        required: true
    },
    event_start_date: {
        type: String,
        required: true
    },
    event_end_date: {
        type: String,
        required: true
    },
    event_budget: {
        type: String,
        required: true
    }
})
// bookings.pre('findOne', function (next) {
//     this.populate('userid');
//     next();
// });
// bookings.pre('find', function (next) {
//     this.populate('userid');
//     next();
// });
// bookings.pre('findOne', function (next) {
//     this.populate('bookieid');
//     next();
// });
// bookings.pre('find', function (next) {
//     this.populate('bookieid');
//     next();
// });
module.exports = mongoose.model("bookings", bookings)