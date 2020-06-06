const express = require('express');
const router = express.Router();
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const { update } = require('./../models/users.model');

router.get('/get', function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;
    getProfile(designation, profileId)
        .then(function (profile) {
            res.status(200).json({
                error: true,
                message: 'Got user',
                data: profile
            })
        }, function (error) {
            res.status(200).json({
                error: true,
                message: 'No profile found',
                data: error
            })
        });
})

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

function updateProfile(role, user_id, updatedata) {
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

        Collection.findOneAndUpdate({
            _id: user_id
        }, { $set: updatedata }, function (error, success) {
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })
    });
}

router.put('/update', function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;
    let updatedata = req.body;
    console.log(profileId, designation, updatedata)
    updateProfile(designation, profileId, updatedata)
        .then(function (profile) {
            console.log(profile)
            let user_id = profile.user_id;
            delete updatedata.email;
            delete updatedata.designation;
            delete updatedata.password;
            delete updatedata.verified;
            Users.findOneAndUpdate({
                _id: user_id
            }, { $set: updatedata }, function (error, success) {
                console.log(error, success)
                if (!error && success != null) {
                    res.status(200).json({
                        error: false,
                        message: 'Profile has been updated',
                        data: {}
                    })
                } else {
                    res.status(200).json({
                        error: true,
                        message: 'Profile can not be updated',
                        data: {}
                    })
                }
            })
        }, function (error) {
            res.status(200).json({
                error: true,
                message: 'No profile found',
                data: error
            })
        });
})

module.exports = router;