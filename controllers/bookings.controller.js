const express = require("express");
const router = express.Router();
const bookings = require("./../models/bookings.model");
const { accessSync } = require("fs");

router.post("/create", function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;

    req.body.bookieid = profileId;
    req.body.status = "pending";
    let count = await checkCalenderOverlap(req.body.profileId, req.body.enent_start_date, req.body.event_end_date)
    if (count == 1) {
        res.status(200).json({
            error: true,
            message: "User is not available in the time frame",
            data: {}
        })
    }
    let bookings_collection = new bookings(req.body);
    bookings_collection.save(function (error, success) {
        if (!error && success != null) {
            res.status(200).json({
                error: false,
                message: "Booking has been requested",
                data: success
            })
        } else {
            res.status(200).json({
                error: true,
                message: error.message,
                data: error
            })
        }
    })
})

router.get("/requests", function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;

    let user_id = profileId;
    let query = {
        user_id: user_id
    }

    // paginations are left to be done
    bookings.find(query).exec(function (error, success) {
        if (!error && success != null) {
            res.status(200).json({
                error: false,
                message: "Got bookings requests",
                data: success
            })
        } else {
            res.status(200).json({
                error: true,
                message: error.message,
                data: error
            })
        }
    })
})

router.get("/myrequests", function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;

    let user_id = profileId;
    let query = {
        bookieid: user_id
    }

    // paginations are left to be done
    bookings.find(query).exec(function (error, success) {
        if (!error && success != null) {
            res.status(200).json({
                error: false,
                message: "Got bookings requests",
                data: success
            })
        } else {
            res.status(200).json({
                error: true,
                message: error.message,
                data: error
            })
        }
    })
})

router.post("/accept", function (req, res) {
    let bookingsId = req.query.bookingsId;


    bookings.findOne({
        _id: bookingsId
    }, async function (error, success) {
        if (!error && success != null) {
            let count = await checkCalenderOverlap(success.userid, success.enent_start_date, success.event_end_date)
            if (count == 1) {
                res.status(200).json({
                    error: true,
                    message: "User is not available in the time frame",
                    data: {}
                })
            } else {
                success.status = "confirmed"
                success.save(function (error, success) {
                    if (!error && success != null) {
                        res.status(200).json({
                            error: false,
                            message: "You have requested the bookings request. Calender event created",
                            data: success
                        })
                    } else {
                        res.status(200).json({
                            error: true,
                            message: error.message,
                            data: error
                        })
                    }
                })
            }
        } else {
            res.status(200).json({
                error: true,
                message: error.message,
                data: error
            })
        }
    })
})

router.post("/reject", function (req, res) {
    let bookingsId = req.query.bookingsId;
    bookings.findOneAndUpdate({
        _id: bookingsId
    }, { $set: { status: "cancelled" } }, function (error, success) {
        if (!error && success != null) {
            res.status(200).json({
                error: false,
                message: "You have cancelled the booking",
                data: success
            })
        } else {
            res.status(200).json({
                error: true,
                message: error.message,
                data: error
            })
        }
    })
})


function getProfile(role, user_id) {
    console.log(role, user_id)
    return new Promise(function (resolve, reject) {
        let Collection;
        switch (role) {
            case 'Pilot':
                Collection = Pilots;
                break;
            case 'Flight Attendant':
                Collection = Attendant;
                break;
            case 'Mechanic':
                Collection = Mechanic;
                break;
            default:
                reject({})
                break;
        }

        console.log(Collection)

        Collection.findOne({
            _id: user_id
        }, function (error, success) {
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })
    });
}

async function checkCalenderOverlap(userid, startdate, enddate) {
    let start_date = new Date(startdate)
    let end_date = new Date(enddate)
    let query = {
        userid: userid,
        $or: [
            {
                event_start_date: {
                    $and: [
                        {
                            $gte: start_date
                        },
                        {
                            $lte: end_date
                        }
                    ]
                },
                event_end_date: {
                    $and: [
                        {
                            $gte: start_date
                        },
                        {
                            $lte: end_date
                        }
                    ]
                }
            }
        ]
    }
    let count = await bookings.estimatedDocumentCount(query);
    return count;
}

module.exports = router
