const express = require('express');
const router = express.Router();
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');

router.get('/get',function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;
    console.log(profileId,designation)
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
            console.log(error, success)
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })
    });
}

module.exports = router;