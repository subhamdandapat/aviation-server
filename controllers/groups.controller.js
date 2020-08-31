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
router.get('/info',function(request,response){

   Groups.findById({_id:request.query.groupId}).populate('posts').exec(function (error, success) {
console.log('group detail',error,success)
if(error){
    response.status(200).json({
        error: true,
        message: 'Error',
        data: error
    })
}else{
    response.status(200).json({
        error: false,
        message: 'Group info',
        data: success
    })
}
   }) 
})


module.exports = router;