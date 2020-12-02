const express = require('express');
const router = express.Router();
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const Social = require('./../models/social.model');
const Post = require('./../models/post.model');
const Groups = require('./../models/groups.model');
const Notification = require('./../models/notification.model');
const helper = require('./../helpers/email.helper');
const bcrypt = require("bcryptjs");
const EmailHelper = require('./../helpers/email.helper');
const jwthelper = require('./../helpers/token.helper');
const moment = require('moment');

//get spepcific user notifcation
router.get('/get', function (request, response) {
    //profileid,designation
    console.log(request.body)
    Notification.find({}, function (error, result) {
        console.log('error  ...', error, result);
        if (error) {
            response.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        }
        else if (result.length > 0) {
            let newarray = [];
            result.forEach(el => {
                console.log('el,el',el)
                el.noti_receiver.forEach(e => {
                    console.log('eeee ',e,request.query.profileId)
                    if (e.profileId == request.query.profileId && e.designation == request.query.designation) {
                        console.log('in')
                        newarray.push(el)
                    }
                })
            })

            response.status(200).json({
                error: false,
                message: 'Notifcation Array ',
                data: newarray
            })

        } else {
            //blank
            response.status(200).json({
                error: false,
                message: 'No Notification',
                data: result
            })
        }
    })
})



module.exports = router;