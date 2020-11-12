const express = require('express');
const router = express.Router();
const Social = require('./../models/social.model');
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const Post = require('./../models/post.model');

router.get('/profile', function (req, res) {
    // console.log('ikugy', req.query.profileId, req.query.role)
    let profileId = req.query.profileId;
    let designation = req.query.role;
    getProfile(designation, profileId)
        .then(function (profile) {
            // console.log(';;;', profile)
            Social.findOne({
                user_id: profile.user_id._id
            }).populate('friendRequests').exec(function (error, success) {
                // console.log('////', error, success)
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
    // console.log('roleeee', role, user_id)
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
            // console.log('social error', error);
            // console.log(' social profile success', success)


            if (!error && success != null) {
                resolve(success)
            } else {
                // console.log("error--->>>" + error);
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
    // console.log(req.body)
    let update = {};
    if (req.body.image) {
        update.background_image = req.body.image;
    }
    if (req.body.about_me) {
        update.about_me = req.body.about_me;
    }
    if (req.body.nickname) {
        update.nickname = req.body.nickname;
    }
    if (req.body.logo) {
        update.logo = req.body.logo;
    }
    getProfile(designation, profileId)
        .then(function (profile) {
            // console.log(';;;', profile)

            Social.findOneAndUpdate({ user_id: profile.user_id._id }, { "$set": update }, { new: true },
                function (error, success) {
                    // console.log('*****', error, success)
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

// profilepic,backgroundpic,post pic
router.get('/photos', function (req, res) {
    let profileId = req.query.profileId;
    let designation = req.query.role;
    getProfile(designation, profileId)
        .then(function (profile) {
            photos(profile).then(function (pics) {

                let picsdata = [];
                if (profile.profile_picture)
                    picsdata.push(profile.profile_picture);
                if (pics[0] != '')
                    picsdata.push(pics[0]);

                res.status(200).json({
                    error: false,
                    message: 'All Pics',
                    pics: pics[1].images.length > 0 ? picsdata.concat(pics[1].images) : picsdata,
                    videos: pics[1].videos
                })
            }, function (error) {
                res.status(200).json({
                    error: true,
                    message: 'Error',
                    data: error
                })
            })

        }, function (error) {
            res.status(200).json({
                error: true,
                message: 'No profile found',
                data: error
            })
        })
})

async function photos(profile) {
    let x;
    await Promise.all([background_image(profile.user_id._id), post_images(profile._id)]).then(function (values) {

        x = values
    })
    return x;
}

async function background_image(user_id) {
    return new Promise(function (resolve, reject) {
        Social.findOne({
            user_id: user_id
        }, function (error, success) {

            if (error) {
                reject(error)
            }
            else {
                resolve(success.background_image ? success.background_image : '')
            }
        })
    })
}

async function post_images(profileId) {
    return new Promise(function (resolve, reject) {
        Post.find({
            profileId: profileId
        }, function (error, success) {

            if (error) {
                reject(error)
            }
            else {

                let images = [];
                let videos = [];
                success.forEach(el => {
                    if (el.image.length > 0) {

                        el.image.forEach(img => {
                            images.push(img)
                        })

                    }
                    if (el.video.length > 0) {

                        el.video.forEach(vid => {
                            videos.push(vid)
                        })

                    }
                })
                let data = {
                    images: images,
                    videos: videos
                }
                resolve(data)
            }
        })
    })
}

// post,profile,photos, get from profileid
router.post('/social_profile', function (req, res) {
    let profileId = req.body.profileId;
    let designation = req.body.designation;
    console.log('reu.body', profileId, designation)
    getProfile(designation, profileId)
        .then(function (profile) {
            console.log('profileeeeeeee', profile)
            getUsersWholeProfile(profile).then(function (data) {
                // console.log('dataaaaaaaa', data)
                let picsdata = [];
                if (profile.profile_picture)
                    picsdata.push(profile.profile_picture);
                // console.log('picsdata avaialble', picsdata)
                if (data[0] != '')
                    picsdata.push(data[0]);
                // console.log('picsdata ', picsdata)
                // console.log('response ', data[3], data[2])

                res.status(200).json({
                    error: false,
                    message: 'User whole profile detail',
                    basic_profile: profile,
                    social_profile: data[3],
                    groups: data[4],
                    posts: data[2],
                    pics: data[1].images.length > 0 ? picsdata.concat(data[1].images) : picsdata,
                    videos: data[1].videos
                })

            }, function (error) {
                // console.log('errror', error)
                res.status(200).json({
                    error: true,
                    message: 'Error',
                    data: error
                })
            })
        })

})

async function getUsersWholeProfile(profile) {
    let x;
    await Promise.all([background_image(profile.user_id._id), post_images(profile._id), user_posts(profile._id), social_profile(profile.user_id._id), groups(profile.user_id._id)]).then(function (values) {

        x = values
    })
    return x;
}

async function user_posts(profileId) {
    return new Promise(function (resolve, reject) {
        Post.find({ profileId: profileId }, function (error, success) {
            if (error) {
                reject(error)
            } else {
                postLike(success).then(function (result) {
                    console.log('jhgfdvcbjh', result)
                    resolve(result)
                })

            }
        })
    })
}

async function postLike(posts) {
    console.log('INSIDE POSTS LIKES')
    let x = [];
    for (const subs of posts) {
        await Promise.all([postLikes(subs)]).then(function (values) {
            console.log('-----------===============', values)
            var data = subs.toObject();
            data.likes = values[0]
            x.push(data)
        })
    }
    return x;
}
// populate profile details inside like
async function postLikes(postlike) {
    console.log('postlike')
    let y = [];
    for (const subs of postlike.likes) {
        await Promise.all([getProfileDetails(subs.designation, subs.profileId)]).then(function (values) {
            console.log(';;;;', values)
            y.push(values[0])
        })
    }
    return y;
}


//GET PROFILE DETAIS OF USER USING RDESIGNATION AND PROFILEID 
function getProfileDetails(role, profileId) {
    console.log('********************* ROLE+PROFILE', role, profileId)
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

//GET DATA FROM SOCIAL DB USING USERID AND POPULATE FRIEND REQUESTS ALSO
async function social_profile(userId) {
    return new Promise(function (resolve, reject) {
        Social.findOne({ user_id: userId }).populate('friendRequests').exec(function (error, success) {
            if (error) {
                reject(error)
            } else {
                resolve(success)
            }
        })
    })
}

async function groups(userId) {
    return new Promise(function (resolve, reject) {
        Social.findOne({ user_id: userId }).populate({
            path: 'groups',
            populate: {
                path: 'posts',
                model: 'Post'
            }
        }).exec(function (error, success) {
            if (error) {
                reject(error)
            } else {
                resolve(success.groups)
            }
        })
    })
}


//SEARCH A USER BY NAME          casesenitive
router.get('/search', function (req, res) {
    //letter
    const search_letter = req.query.search;
    // updatedsearchletter = search_letter.trim().toUpperCase();
    // console.log("updated----->"+updatedsearchletter);
    Users.find({}, function (error, list) {
        console.log('users list', error, list)
        if (error) {
            res.status(200).json({
                error: true,
                message: 'Error.',
                data: error
            })
        }
        else if (list.length == 0) {
            res.status(200).json({
                error: false,
                message: 'No Result Found',
                data: []
            })
        }
        else {
            getProfileIdDesignation(list, search_letter).then(function (result) {
                console.log('result', result)
                res.status(200).json({
                    error: false,
                    message: 'Searched Result.',
                    data: result
                })
            }, function (error) {
                res.status(200).json({
                    error: true,
                    message: 'Error.',
                    data: error
                })
            })
        }
    })
})

//get users which have same name
async function getProfileIdDesignation(list, search_letter) {
    let y = [];
    console.log("list----->" + list);
    for (const subs of list) {
        let name = (subs.first_name)
        console.log("name----->>" + name);
        if (name.startsWith(search_letter)) {
            await Promise.all([userProfile(subs._id, subs.designation)]).then(function (values) {
                console.log("values------>>>" + values);
                y.push({ name: subs.first_name + ' ' + subs.last_name, userId: subs._id,
                 designation: subs.designation, profileId: values[0][0]._id,profile_picture:values[0][0].profile_picture?values[0][0].profile_picture:null })
            })
        }

    }
    console.log("yyyyy------>>>" + y)
    return y;
}

//profile of user
async function userProfile(id, designation) {

    return new Promise(function (resolve, reject) {
        let Collection;
        switch (designation) {
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
        Collection.find({ user_id: id }, function (error, success) {
            // console.log('attendant', error, success)
            if (error) {
                reject(error)
            } else {
                resolve(success)
            }
        })
    })

}

//rate or review
router.put('/rate_review', function (request, response) {
    //rate,review,socialid or userid(to whom rate is given)
    console.log('***************** query', request.query.role, request.query.profileId)
    let updateData = {
        rating: request.body.rating ? request.body.rating : 0,
        review: request.body.review ? request.body.review : '',
        profileId: request.query.profileId,
        designation: request.query.role
    }
    getProfileDetails(request.query.role, request.query.profileId).then(function (profiledata) {
        console.log('*********************** profiledata', profiledata);
        updateData.userId = profiledata.user_id._id;
        updateData.name = profiledata.user_id.first_name + ' ' + profiledata.user_id.last_name;
        console.log('kj', updateData);
        Social.findById({ _id: request.body.socialId }, function (error, socialdata) {
            console.log('social data', error, socialdata);
            if (error) {
                response.status(200).json({
                    error: true,
                    message: 'Error.',
                    data: error
                })
            } else if (socialdata == null) {
                //not found
                response.status(200).json({
                    error: false,
                    message: 'Social Profile Not Found.',
                    data: socialdata
                })
            } else {
                let reviews = socialdata.rating_reviews;
                let index = (reviews).findIndex(x => x.profileId == request.query.profileId);
                console.log('index', index)
                if (index == -1) {
                    //add review
                    let avg_rating = findAverageRating(reviews.concat([updateData]))
                    Social.findOneAndUpdate({ _id: request.body.socialId }, { $push: { rating_reviews: updateData }, $set: { avg_rating: avg_rating } },
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
                    Social.findOneAndUpdate({ _id: request.body.socialId }, {
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

function findAverageRating(list) {
    var total = 0;
    for (var i = 0; i < list.length; i++) {
        total += list[i].rating;
    }
    var avg = total / list.length;
    console.log(avg, total)
    return (avg.toPrecision(1))
}

//START FOLLOWING A SOCIAL PROFILE
router.post('/follow', function (request, response) {
    // req.query.profileId,req.query.role,req.body.profileId,req.body.designation

    getSocialId(request.query, request.body).then(function (result) {
        console.log('jkfhg ', result)
        let followerdata = {                //me
            profileId: request.query.profileId,
            designation: request.query.role,
            socialId: result[0][0]._id,
            name: result[0][0].user_id.first_name + ' ' + result[0][0].user_id.last_name,
            profile_picture: result[0][0].profile_picture
        }
        let followingdata = {
            profileId: request.body.profileId,
            designation: request.body.designation,
            socialId: result[0][1]._id,
            name: result[0][1].user_id.first_name + ' ' + result[0][0].user_id.last_name,
            profile_picture: result[0][1].profile_picture
        }
        saveToSocial(followerdata, followingdata).then(function (savedResult) {
            console.log('lkj ', savedResult)
            response.status(200).json({
                error: false,
                message: 'Followed Social Profile.',
                data: savedResult[0][1]
            })
        }, function (error) {
            response.status(200).json({
                error: false,
                message: 'Error.',
                data: error
            })
        })

    }, function (error) {
        console.log(error)
        response.status(200).json({
            error: false,
            message: 'Error.',
            data: error
        })
    })
})

async function getSocialId(query, body) {
    let x = [];
    await Promise.all([fetchSocialId(query.profileId, query.role), fetchSocialId(body.profileId, body.designation)]).then(function (values) {
        console.log('VALUES ', values)
        x.push(values)

    })
    return x
}

async function fetchSocialId(profileId, designation) {
    return new Promise(function (resolve, reject) {
        let Collection;
        switch (designation) {
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
            console.log('xbvc ', success, error)
            if (!error && success != null) {
                Social.findOne({ user_id: success.user_id._id }, function (error, result) {
                    console.log('kljfk ', result)
                    if (!error && result != null) {
                        result.profile_picture=success.profile_picture
                        resolve(result)
                    }
                    else {
                        reject(error)
                    }
                })

            } else {

                reject(error)
            }
        })
    });
}

async function saveToSocial(followerdata, followingdata) {
    console.log('inside savetosocial', followerdata, followingdata)
    let x = [];
    await Promise.all([saveFollowerToSocial(followerdata), saveFollowingToSocial(followingdata)]).then(function (values) {
        console.log('VALUES  222 ', values)
        x.push(values)

    })
    return x;
}
async function saveFollowerToSocial(data) {
    console.log('savesocialfollower',data)
    return new Promise(function (resolve, reject) {
        Social.findByIdAndUpdate({ _id: data.socialId }, {
            $addToSet: {
                followers: {
                    profileId: data.profileId,
                    designation: data.designation,
                     name: data.name, 
                     profile_picture: data.profile_picture
                }
            }
        },
            { returnOriginal: false },
            function (error, newupdate) {
                console.log('error1', error, newupdate)
                if (!error && newupdate != null) {
                    resolve(newupdate)
                }
                else {
                    reject(error)
                }
            })
    })
}

async function saveFollowingToSocial(data) {
    console.log('savesocialfollowing',data)
    return new Promise(function (resolve, reject) {
        Social.findByIdAndUpdate({ _id: data.socialId }, { $addToSet: { following: { profileId: data.profileId, 
            designation: data.designation ,
              name: data.name, 
            profile_picture: data.profile_picture} } },
            { returnOriginal: false },
            function (error, newupdate) {
                console.log('error1', error, newupdate)
                if (!error && newupdate != null) {
                    resolve(newupdate)
                }
                else {
                    reject(error)
                }
            })
    })
}

module.exports = router;