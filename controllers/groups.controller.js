const express = require('express');
const router = express.Router();
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const Social = require('./../models/social.model');
const Groups = require('./../models/groups.model');
const Post = require('./../models/post.model');
const helper = require('./../helpers/email.helper');
const bcrypt = require("bcryptjs");
const EmailHelper = require('./../helpers/email.helper');
const jwthelper = require('./../helpers/token.helper');
const moment = require('moment');


//CREATE GROUP AND UPDATE  SOCIAL BY GROUP ID
router.post('/new', function (request, response) {
    let profileId = request.query.profileId;
    let designation = request.query.role;
    let data = {
        profileId: profileId,
        designation: designation,
        name: request.body.name ? request.body.name : '',
        purpose: request.body.purpose ? request.body.purpose : '',
        members: request.body.members ? request.body.members : []
    }
    if (request.body.profile_picture) {
        data.profile_picture = request.body.profile_picture
    }
    if (request.body.cover_picture) {
        data.cover_picture = request.body.cover_picture
    }
    requestdata = new Groups(data);
    getProfile(designation, profileId).then(function (success) {
        let socialId = success._id;

        requestdata.save(function (error, newgroup) {
            console.log('data', error, newgroup)
            if (error) {
                response.status(200).json({
                    error: true,
                    message: 'Error',
                    data: error
                })
            } else {
                console.log('jnnn', socialId)
                //update social with group id 

                Social.findByIdAndUpdate({ _id: socialId }, { $addToSet: { groups: newgroup._id } }, function (error, updated) {
                    console.log('error', error, updated)
                    if (error) {
                        response.status(200).json({
                            error: true,
                            message: 'Error',
                            data: error
                        })
                    } else {
                        response.status(200).json({
                            error: false,
                            message: 'Group Created Successfully.',
                            data: newgroup
                        })
                    }
                })
            }
        })
    }, function (error) {
        response.status(200).json({
            error: true,
            message: 'Error',
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

            if (!error && success != null) {
                Social.findOne({ user_id: success.user_id._id }, function (error, success1) {
                    console.log('success1', success1, success)
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

//GET DETAIL OF A GROUP BY GROUP ID
router.get('/info', function (request, response) {

    Groups.findById({ _id: request.query.groupId }).populate('posts').exec(function (error, success) {
        console.log('group detail', error, success)
        if (error) {
            response.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        } else {
            response.status(200).json({
                error: false,
                message: 'Group info',
                data: success
            })
        }
    })
})



//LIST OF ALL GROUPS 
router.get('/all', function (request, response) {
    Groups.find({}, function (error, success) {
        if (error) {
            response.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        } else {
            response.status(200).json({
                error: false,
                message: 'List of groups',
                data: success
            })
        }
    })
})
//update group infoq include all members while creation

//UPDATE GROUP NAME,PURPOSE,coverPICture,profile picture
router.put('/update', function (request, response) {
    groupId = request.body.groupId;
    let updateData = {};

    if (request.body.name) {
        updateData.name = request.body.name;
    }
    if (request.body.purpose) {
        updateData.purpose = request.body.purpose;
    }
    if (request.body.cover_picture) {
        updateData.cover_picture = request.body.cover_picture;
    }
    if (request.body.profile_picture) {
        updateData.profile_picture = request.body.profile_picture;
    }
    Groups.findOneAndUpdate({ _id: groupId }, { "$set": updateData }, { new: true }, function (error, success) {
        console.log(error, success)
        if (error) {
            response.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        } else {
            response.status(200).json({
                error: false,
                message: 'Updated Group Info.',
                data: success
            })
        }
    })

})

router.put('/addmember', function (request, response) {
    //group id,members:[]
    let groupId = request.body.groupId;
    let members = request.body.members;
    Groups.findOneAndUpdate({ _id: groupId }, { $push: { members: { $each: members } } }, { new: true }, function (error, success) {
        if (error) {
            response.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        } else {
            response.status(200).json({
                error: false,
                message: 'Member added to group.',
                data: success
            })
        }
    })

})

//rate or review
router.put('/rate_review', function (request, response) {
    //rate,review,socialid or userid(to whom rate is given)
    let updateData = {
        rating: request.body.rating ? request.body.rating : 0,
        review: request.body.review ? request.body.review : '',
        profileId: request.query.profileId,
        designation: request.query.role
    }
    getProfileDetails(request.query.role, request.query.profileId).then(function (profiledata) {
        console.log('profiledata', profiledata);
        updateData.userId = profiledata.user_id._id;
        updateData.name = profiledata.user_id.first_name + ' ' + profiledata.user_id.last_name;
        console.log('kj', updateData);
        Groups.findById({ _id: request.body.groupId }, function (error, groupdata) {
            console.log('social data', error, groupdata);
            let reviews = groupdata.rating_reviews;
            let index = (reviews).findIndex(x => x.profileId == request.query.profileId);
            console.log('index', index)
            if (index == -1) {
                //add review
                let avg_rating = findAverageRating(reviews.concat([updateData]))
                console.log('g ', avg_rating, [updateData])

                Groups.findOneAndUpdate(
                    { _id: request.body.groupId }, 
                    { $push: { rating_reviews: updateData },$set: {avg_rating: avg_rating } },
            
                    { new: true }, function (error, updated) {
                        console.log('updated', error, updated)
                        if (error) {
                            response.status(200).json({
                                error: true,
                                message: 'Error.',
                                data: error
                            })
                        } else {
                            response.status(200).json({
                                error: false,
                                message: 'Reviews added successsfully.',
                                data: updated
                            })
                        }

                    })
            } else {
                //already present
                reviews[index].rating = request.body.rating ? request.body.rating : reviews[index].rating;
                reviews[index].review = request.body.review ? request.body.review : reviews[index].review;
                let avg_rating = findAverageRating(reviews)
                Groups.findOneAndUpdate({ _id: request.body.groupId }, {
                    "$set": {
                        rating_reviews: reviews,
                        avg_rating: avg_rating
                    },

                }, { new: true }, function (error, updated) {
                    console.log('updated', error, updated)
                    if (error) {
                        response.status(200).json({
                            error: true,
                            message: 'Error.',
                            data: error
                        })
                    } else {
                        response.status(200).json({
                            error: false,
                            message: 'Reviews Updated Successsfully.',
                            data: updated
                        })
                    }

                })
            }
        })
    }, function (error) {
        response.status(200).json({
            error: true,
            message: 'Error.',
            data: error
        })
    })
})


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

function findAverageRating(list) {
    var total = 0;
    for (var i = 0; i < list.length; i++) {
        total += list[i].rating;
    }
    var avg = total / list.length;
    console.log(avg, total)
    return (avg.toPrecision(1))
}

module.exports = router;