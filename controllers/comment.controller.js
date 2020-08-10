const express = require('express');
const router = express.Router();
const Social = require('./../models/social.model');
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const Post = require('./../models/post.model');
const Comment = require('./../models/comment.model');


router.post('/new', function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;

    getProfile(designation, profileId)
        .then(function (success) {
         
            let data = {
                profileId: profileId,
                designation: designation,
                postId: req.body.postId,
                text: req.body.text ? req.body.text : '',
                userid: success.user_id._id,
                profile_picture: success.profile_picture
            }
            if (req.body.image) {
                data.image = req.body.imageId;
            }
            requestdata = new Comment(data);
            requestdata.save(function (error, newcomment) {
                console.log('****************', error, newcomment)
                if (error) {
                    res.status(200).json({
                        error: true,
                        message: 'Error',
                        data: error
                    })
                }
                else {
                    Post.updateOne({ _id: req.body.postId }, { $addToSet: { comments: newcomment._id } }, function (error, newupdate) {
                        console.log(';;;;;', newupdate)
                        if (error) {
                            res.status(200).json({
                                error: true,
                                message: 'Error',
                                data: error
                            })
                        }
                        else {
                            res.status(200).json({
                                error: false,
                                message: 'Comment added successfully',
                                data: newupdate
                            })
                        }
                    })

                }
            })

        }, function (error) {
            res.status(200).json({
                error: true,
                message: 'No profile found',
                data: error
            })
        })
})

function getProfile(role, profileid) {

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
            _id: profileid                                                 //find by id in profile
        }, function (error, success) {
            if (error) {
                reject(error)
            }
            else {
                resolve(success)
            }
        })
    });
}


module.exports = router;