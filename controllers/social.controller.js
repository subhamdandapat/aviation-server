const express = require('express');
const router = express.Router();
const Social = require('./../models/social.model');
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const Post = require('./../models/post.model');

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
    console.log('roleeee', role, user_id)
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
            console.log('social error', error);
            console.log(' social profile success', success)


            if (!error && success != null) {
                resolve(success)
            } else {
                console.log("error--->>>" + error);
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
                console.log('dataaaaaaaa', data)
                let picsdata = [];
                if (profile.profile_picture)
                    picsdata.push(profile.profile_picture);
                console.log('picsdata avaialble', picsdata)
                if (data[0] != '')
                    picsdata.push(data[0]);
                console.log('picsdata ', picsdata)
                console.log('response ', data[3], data[2])

                res.status(200).json({
                    error: false,
                    message: 'User whole profile detail',
                    basic_profile: profile,
                    social_profile: data[3],
                    posts: data[2],
                    pics: data[1].images.length > 0 ? picsdata.concat(data[1].images) : picsdata,
                    videos: data[1].videos
                })

            }, function (error) {
                console.log('errror', error)
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
    await Promise.all([background_image(profile.user_id._id), post_images(profile._id), user_posts(profile._id), social_profile(profile.user_id._id)]).then(function (values) {

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
                resolve(success)
            }
        })
    })
}

async function social_profile(userId) {
    return new Promise(function (resolve, reject) {
        Social.findOne({ user_id: userId }, function (error, success) {
            if (error) {
                reject(error)
            } else {
                resolve(success)
            }
        })
    })
}

//SEARCH A USER BY NAME          casesenitive
router.get('/search', function (req, res) {
    //letter
    const search_letter = req.query.search;
    updatedsearchletter = search_letter.trim().toUpperCase();
    console.log("updated----->"+updatedsearchletter);
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
            getProfileIdDesignation(list, updatedsearchletter).then(function (result) {
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
    console.log("list----->"+list);
    for (const subs of list) {
        let name = (subs.first_name).trim().toUpperCase();
        console.log("name----->>"+name);
        if (name.startsWith(search_letter)) {
            await Promise.all([userProfile(subs._id, subs.designation)]).then(function (values) {
                console.log("values------>>>"+values);
                y.push({ name: subs.first_name + ' ' + subs.last_name, userId: subs._id, designation: subs.designation, profileId: values[0][0]._id })
            })
        }

    }
    console.log("yyyyy------>>>"+y)
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
            console.log('attendant', error, success)
            if (error) {
                reject(error)
            } else {
                resolve(success)
            }
        })
    })

}
module.exports = router;