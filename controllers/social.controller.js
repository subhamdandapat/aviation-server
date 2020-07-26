const express = require('express');
const router = express.Router();
const Social = require('./../models/social.model');
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');



router.get('/profile', function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;
    Social.findOne({
        _id: profileId
    }, function (error, success) {
        if (error) {
            res.status(200).json({
                error: true,
                message: 'No profile found.',
                data: error
             })
        } else {
            getProfile(designation, success.user_id._id)
                .then(function (profile) {
                    
                    res.status(200).json({
                        error: false,
                        message: 'User profile data.',
                        basic_profile: profile,
                        social_profile:success
                    })
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
            user_id: user_id                                                 //find by userid in profile
        }, function (error, success) {
           
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })
    });
}














module.exports = router;