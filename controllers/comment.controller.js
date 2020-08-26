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
                    Post.findByIdAndUpdate({ _id: req.body.postId }, { $addToSet: { comments: newcomment._id } }, { returnOriginal: false }, function (error, newupdate) {
                       
                        if (error) {
                            res.status(200).json({
                                error: true,
                                message: 'Error',
                                data: error
                            })
                        }
                        else {
                            populateCommentsLikes(newupdate).then(function (response) {
                              
                               let data=newupdate.toObject();
                                data.comments = response[0][0];
                                data.likes = response[0][1];

                                res.status(200).json({
                                    error: false,
                                    message: 'Comment added successfully',
                                    data: data
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


async function populateCommentsLikes(post){
    let z=[]
    await Promise.all([populatecomments(post),postLikes(post)]).then(function (values) {
       
        z.push(values)
    }) 
    return z
}
async function populatecomments(comment) {
    let x = [];
    for (const subs of comment.comments) {
        await Promise.all([detailedComments(subs)]).then(function (values) {
            x.push(values[0][0])
        })
    }
    return x;
}

async function detailedComments(sub) {
    return new Promise(function (resolve, reject) {
        Comment.find({ _id: sub }).populate('userid').exec(function (error, detail) {
            if (error) {
                reject(error)
            }
            else {
                let Collection;
                let data = detail[0].toObject();
              
                switch ((data.designation)) {
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
                    _id: data.profileId                                                 //find by userid in profile
                }, function (error, success) {
        
                    if (!error && success != null) {
                    
                     data.profile_picture=success.profile_picture
                        resolve(data)
                    } else {
                        reject(error)
                    }
                })
                resolve(detail)
            }
        })
    })
}

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

// populate profile details inside like
async function postLikes(postlike) {

    let y = [];
    for (const subs of postlike.likes) {
        await Promise.all([getProfile(subs.designation, subs.profileId)]).then(function (values) {
           
            y.push(values[0])
        })
    }
    return y;
}

module.exports = router;