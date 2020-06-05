const express = require('express');
const router = express.Router();
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const helper = require('./../helpers/email.helper');
const bcrypt = require("bcryptjs");
const EmailHelper = require('./../helpers/email.helper');
const jwthelper = require('./../helpers/token.helper');

router.post('/register', function (req, res) {
    bcrypt.hash(req.body.password, 8, (err, hashedPassword) => {
        req.body.password = hashedPassword;
        let user_document = new Users(req.body);
        console.log(req.body.password)
        user_document.save(function (error, success) {
            if (!error && success != null) {
                req.body.user_id = success._id;
                createProfile(req.body)
                    .then(function (success) {
                        let email = req.body.email;
                        let url = "http://localhost:3000/verify?_id=" + req.body.user_id
                        EmailHelper.sendEmail(email, 'You have been registered successfully', "<p>You have been registered.Click <a href='" + url + "'>here </a> to verify email</p>");
                        res.status(200).json({
                            error: false,
                            message: 'You have been registered',
                            data: success
                        })
                    }, function (error) {
                        res.status(200).json({
                            error: true,
                            message: 'Can not create profile',
                            data: error
                        })
                    });
            } else {
                res.status(200).json({
                    error: true,
                    message: error.msg,
                    data: error
                })
            }
        })
    })
});


function createProfile(profile) {
    let profile_document;
    return new Promise(function (resolve, reject) {
        if (profile.designation == 'Pilot') {
            profile_document = new Pilots(profile)
        } else if (profile.designation == 'Flight Attendant') {
            profile_document = new Attendant(profile)
        } else if (profile.designation == 'Mechanic') {
            profile_document = new Mechanic(profile)
        }
        profile_document.save(function (error, success) {
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        });
    });
}

function getProfile(role, user_id) {
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

        Collection.findOne({
            user_id: user_id
        }, function (error, success) {
            console.log(error, success)
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })
    });
}


router.post('/login', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let  client = {
        agent: req.header('user-agent'), // User Agent we get from headers
        referrer: req.header('referrer'), //  Likewise for referrer
        ip: req.header('x-forwarded-for') || req.connection.remoteAddress, // Get IP - allow for proxy
    };
    Users.findOne({
        email: email,
    }, function (error, success) {
        if (!error && success != null) {
            let hashedPassword = success.password;
            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    res.status(200).json({
                        error: true,
                        message: 'Wrong credentials',
                        data: {}
                    })
                } else {
                    let verified = success.verified;
                    if (verified) {
                        let designation = success.designation;
                        let user_id = success._id;
                        getProfile(designation, user_id)
                            .then(function (profile) {
                                // with JWT
                                jwthelper.generateToken(profile._id, success.designation, client.ip, client.agent)
                                    .then(function (success) {
                                        res.status(200).json({
                                            error: false,
                                            message: 'User logged in successfully',
                                            data: success.token
                                        })
                                    });
                            }, function (error) {
                                res.status(200).json({
                                    error: true,
                                    message: 'Wrong Credentials',
                                    data: error
                                })
                            });
                    } else {
                        res.status(200).json({
                            error: true,
                            message: 'Please verify your email id',
                            data: {}
                        })
                    }
                }
            });
        } else {
            res.status(200).json({
                error: true,
                message: 'Wrong credentials',
                data: {}
            })
        }
    })
})



module.exports = router;