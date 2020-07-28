const express = require('express');
const router = express.Router();
const Social = require('./../models/social.model');
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');



router.get('/profile', function (req, res) {
    console.log('ikugy', req.query.profileId, req.query.role)
    let profileId = req.query.profileId;
    let designation = req.query.role;
    getProfile(designation, profileId)
        .then(function (profile) {
            console.log(';;;', profile)
            Social.findOne({
                user_id: profile.user_id._id
            }, function (error, success) {
                console.log('////', error, success)
                if (error) {
                    res.status(200).json({
                        error: true,
                        message: 'No profile found.',
                        data: error
                    })
                } else {
                    res.status(200).json({
                        error: false,
                        message: 'User profile data.',
                        basic_profile: profile,
                        social_profile: success
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
            _id: user_id                                                 //find by userid in profile
        }, function (error, success) {

            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })
    });
}


router.put('/update', function (req, res) {
    // background image,webtoken()
    // let background_image=req.body.image;
    // let about_me=req.body.about_me;
    let profileId = req.query.profileId;
    let designation = req.query.role;
    let socialId = req.query.profileId;
    console.log(req.body)
    let update = {};
    if (req.body.image) {
        update = { "background_image": req.body.image }
    }
    if (req.body.about_me) {
        update = { "about_me": req.body.about_me }
    }
    getProfile(designation, profileId)
        .then(function (profile) {
            console.log(';;;', profile)
            
            Social.findOneAndUpdate({ user_id: profile.user_id._id }, { "$set": update }, { new: true },
                function (error, success) {
                    console.log('*****', error, success)
                    if (error) {
                        res.status(200).json({
                            error: true,
                            message: 'Error occurred.',
                            data: error
                        })
                    }
                    else {
                        res.status(200).json({
                            error: false,
                            message: req.body.image ? 'Background image uploaded.' : 'Profile updated.',
                            data: success
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