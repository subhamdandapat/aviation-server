const express = require("express");
const router = express.Router();
const bookings = require("./../models/bookings.model");
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const { accessSync } = require("fs");

router.post("/create",async function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;

    req.body.bookieid = profileId;
    req.body.bookieDesignation = designation;
    req.body.event_status = "pending";
    let count = await checkCalenderOverlap(req.query.profileId, req.body.event_start_date, req.body.event_end_date)
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

//my requests 
router.get("/requests", function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;
getProfile(designation,profileId).then(function(result){
    console.log(result)
    let query = {
        userid: result.user_id._id
    }
     // paginations are left to be done
     bookings.find(query).exec(function (error, success) {
        console.log(error,success)
        if (!error && success != null) {
            getBookieDetail(success).then(function(result){
                res.status(200).json({
                    error: false,
                    message: "Got bookings requests",
                    data: result
                })
            },function(error){
                res.status(200).json({
                    error: true,
                    message: 'Error',
                    data: error
                })    
            })
           
        } else {
            res.status(200).json({
                error: true,
                message: error.message,
                data: error
            })
        }
    })
},function(error){
    res.status(200).json({
        error: true,
        message: 'Error',
        data: error
    })
})
   
})


//i have requested 
router.get("/myrequests", function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;

    let user_id = profileId;
    let query = {
        bookieid: user_id
    }

    // paginations are left to be done
    bookings.find(query).exec(function (error, success) {
        console.log('jkh ',success)
        if (!error && success != null) {

            getBookieDetail(success).then(function(result){
                res.status(200).json({
                    error: false,
                    message: "Got bookings requests",
                    data: result
                })
            },function(error){
                res.status(200).json({
                    error: true,
                    message: 'Error',
                    data: error
                })  
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
            let count = await checkCalenderOverlap(success.userid, success.event_start_date, success.event_end_date)
            if (count == 1) {
                res.status(200).json({
                    error: true,
                    message: "User is not available in the time frame",
                    data: {}
                })
            } else {
                success.event_status = "confirmed"
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
    }, { $set: { event_status: "cancelled" } }, function (error, success) {
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

async function getBookieDetail(list){
    let y = [];
    for (const subs of list) {
        await Promise.all([getProfile(subs.bookieDesignation, subs.bookieid)]).then(function (values) {
            console.log(';;;;', values)
            let data=subs.toObject();
            data.bookieData=values[0]
            y.push(data)
        })
    }
    return y;
}
async function getProfile(role, id) {
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
            _id: id
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
    console.log('kkkkkkkkkkkkkkkkkk',userid,startdate,enddate)
    let start_date = new Date(startdate)
    let end_date = new Date(enddate)
    let query = {
        userid: userid._id,
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
