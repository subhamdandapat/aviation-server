const express = require('express');
const router = express.Router();
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const Social = require('./../models/social.model');
const Post = require('./../models/post.model');
const helper = require('./../helpers/email.helper');
const bcrypt = require("bcryptjs");
const EmailHelper = require('./../helpers/email.helper');
const jwthelper = require('./../helpers/token.helper');
const moment = require('moment');
// const { post } = require('./users.controller');


router.post('/new', function (req, res) {
    //profileid,text,
    let profileId = req.query.profileId;
    let designation = req.query.role;
    let db_collection = '';
    if (designation === 'Pilot') {
        db_collection = 'Pilots'
    }
    if (designation === 'Flight Attendant') {
        db_collection = 'Attendant'
    }
    if (designation === 'Mechanic') {
        db_collection = 'Mechanic'
    }
    getProfile(designation, profileId)
        .then(function (success) {

            console.log('success', success)
            let data = {
                profileId: profileId,
                text: req.body.text ? req.body.text : '',
                user_id: success.user_id._id,
                socialId: success._id,
                db_collection: db_collection,
                image: req.body.image ? req.body.image : [],
                video: req.body.video ? req.body.video : []
            }
            requestdata = new Post(data);
            requestdata.save(function (error, newpost) {
                console.log('lkjgklh', error, newpost)
                if (error) {
                    res.status(200).json({
                        error: true,
                        message: 'Error',
                        data: error
                    })
                } else if (newpost) {
                    newpost.user_id = success.user_id
                    res.status(200).json({
                        error: false,
                        message: 'Post created Successfully',
                        data: newpost
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

            if (!error && success != null) {
                Social.findOne({ user_id: success.user_id._id }, function (error, success1) {
                    console.log('success1', success1)
                    if (!error && success1 != null) {
                        resolve(success1)
                    } else {
                        reject(error)

                    }
                })

            } else {
                reject(error)
            }
        })
    });
}

router.get('/all', function (req, res) {
    Post.find({}).sort({ createdDate: -1 }).populate('comments').exec(function (error, success) {
if(error){
    res.status(200).json({
        error: true,
        message: 'Error',
        data: error
    })
}
else{
    getProfileImage(success).then(function (profileimage) {
        res.status(200).json({
            error: false,
            message: 'Post  List ',
            data: profileimage
        })
    }, function (error) {
        res.status(200).json({
            error: true,
            message: 'Error',
            data: error
        })
    })
}
     


    })
})


router.get('/profile', function (req, res) {
    let profileId = req.query.profileId
    Post.find({ profileId: profileId }).sort({ createdDate: -1 }).populate('comments').exec(function (error, success) {
        if(error){
            res.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        }
        else{
        getProfileImage(success).then(function (profileimage) {
            res.status(200).json({
                error: false,
                message: 'Post  List ',
                data: profileimage
            })
        }, function (error) {
            res.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        })
    } 
    })
})

async function getProfileImage(array) {
    let x = [];
    for (const subs of array) {
        await Promise.all([getImage(subs)]).then(function (values) {
            var data = subs.toObject();
            data.profile_picture = values[0].profile_picture;
            x.push(data)
        })
    }
    return x;

}

async function getImage(profile) {
    return new Promise(function (resolve, reject) {
        let Collection;
        switch (profile.db_collection) {
            case 'Pilots':
                Collection = Pilots;
                break;
            case 'Attendant':
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
            _id: profile.profileId                                                 //find by userid in profile
        }, function (error, success) {

            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })

    })
}

router.put('/like', function (req, res) {    //postid from req body
    let profileId = req.query.profileId;
    let designation = req.query.role;
    let postId = req.body.postId;
    like = {
        profileId: profileId,
        designation: designation
    }
    Post.findById({ _id: postId }, function (error, postdetail) {
        if (error) {
            res.status(200).json({
                error: true,
                message: 'Post not found.',
                data: error
            })
        }
        else {
            let exists = false;
            let newArray=postdetail.likes;
            if(postdetail.likes.length>0)
            postdetail.likes.forEach(el => {
                if (el.profileId != profileId && el.designation != designation) {
                    newArray.push(like)
                }
            })
            else
            newArray.push(like)
            // if (exists == true) {
            //     //alreasy liked
            //     res.status(200).json({
            //         error: false,
            //         message: 'Post Already Liked.',

            //     })
            // }
            // else {
            //     //save 
            //     postdetail.likes.push(like);

                postdetail.save(function (error, success) {

                    if (error) {
                        res.status(200).json({
                            error: true,
                            message: 'Error Occurred ',
                            data: error
                        })
                    }
                    else {
                        res.status(200).json({
                            error: false,
                            message: 'Post  Liked Successfully',
                            data: success
                        })
                    }
                })
            // }
        }
    })

})

module.exports = router;