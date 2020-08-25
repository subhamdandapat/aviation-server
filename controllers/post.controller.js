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
const { post } = require('./social.controller');
// const { post } = require('./users.controller');

// NEW POST CREATION
router.post('/new', function (req, res) {
    //profileid,text,taggedusers
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
                video: req.body.video ? req.body.video : [],
                location:req.body.location?req.body.location:'',
                taggedUsers:req.body.taggedUsers?req.body.taggedUsers:[]
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

// ALL POSTS LIST
router.get('/all', function (req, res) {
    Post.find({}).sort({ createdDate: -1 }).populate('comments').exec(function (error, success) {
        if (error) {
            res.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        }
        else {
            like_image_details(success).then(function (like_image) {

                res.status(200).json({
                    error: false,
                    message: 'Post  List ',
                    data: like_image
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

// GET POST LIST OF A PARTICULAR USER
router.get('/profile', function (req, res) {
    let profileId = req.query.profileId
    Post.find({ profileId: profileId }).sort({ createdDate: -1 }).populate('comments').exec(function (error, success) {
        if (error) {
            res.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        }
        else {
            like_image_details(success).then(function (like_image) {
                res.status(200).json({
                    error: false,
                    message: 'Post  List ',
                    data: like_image
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

async function like_image_details(array) {
    let x = [];
    for (const subs of array) {
        await Promise.all([getImage(subs), postLikes(subs)]).then(function (values) {
            console.log('-----------===============', values)
            var data = subs.toObject();
            data.profile_picture = values[0].profile_picture;
            data.likes = values[1]
            x.push(data)
        })
    }
    return x;
}

//fetch profilepicture of user
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

// populate profile details inside like
async function postLikes(postlike) {
    console.log(postlike)
    let y = [];
    for (const subs of postlike.likes) {
        await Promise.all([getProfileDetails(subs.designation, subs.profileId)]).then(function (values) {
            console.log(';;;;', values)
            y.push(values[0])
        })
    }
    return y;
}

//get profile details of user 
function getProfileDetails(role, profileId) {
    console.log(role, profileId)
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
            _id: profileId                                                 //find by userid in profile
        }, function (error, success) {

            if (!error && success != null) {
                resolve(success)
            } else {

                reject(error)
            }
        })
    });
}
// LIKE UNLIKE A POST
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
            if (postdetail != null && Object.keys(postdetail).length > 0) {
                let index = (postdetail.likes).findIndex(x => x.profileId == profileId);
                let exists = false;
                console.log(index)
                if (index != -1) {
                    //already present
                    (postdetail.likes).splice(index, 1)
                    exists = true;

                } else {
                    postdetail.likes.push(like);
                    exists = false;
                }

                postdetail.save(function (error, success) {

                    if (error) {
                        res.status(200).json({
                            error: true,
                            message: 'Error Occurred. ',
                            data: error
                        })
                    }
                    else {
                        postLikes(success).then(function (result) {
                            let response = (success).toObject()
                            response.likes = result
                            res.status(200).json({
                                error: false,
                                message: exists == true ? 'Post  UnLiked Successfully' : 'Post Liked Successfully.',
                                data: response
                            })
                        }, function (error) {
                            res.status(200).json({
                                error: true,
                                message: 'Error Occurred. ',
                                data: error
                            })
                        })

                    }
                })
            }

            // }
        }
    })

})

//GET DEATILS OF SINGLR POST FROM POST ID
router.get('/single',function(req,res){
//postId
Post.findById({_id:req.body.postId}).populate('comments').exec(function (error, success) {
    // console.log(error,success);
    if(error || success==null){
        res.status(200).json({
            error: true,
            message: 'Error',
            data: error
        })
    }else{
        singlePostDetails(success).then(function(values){
            res.status(200).json({
                error: false,
                message: 'Post Detail ',
                data: values
            })
        },function(error){
            res.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        })
    }
   
})

})
async function singlePostDetails(post){
    let data;
    await Promise.all([getImage(post), postLikes(post)]).then(function (values) {
        console.log(';;;;',values[0])
        console.log('/**/*/*/*',values[1])
       data = post.toObject();
        data.profile_picture = values[0].profile_picture;
        data.likes = values[1]
        // x.push(data)
    })
    return data;
}

module.exports = router;