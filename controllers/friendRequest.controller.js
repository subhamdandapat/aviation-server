const express = require('express');
const router = express.Router();
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const Social = require('./../models/social.model');
const FriendRequest = require('./../models/friendRequest.model');
const notification = require('./../models/notification.model')

//SEND NEW FRIEND REQUEST
router.post('/send', function (request, response) {
    // senderProfileId,senderDesignation,senderName,senderProfile_picture,
    // receiverProfileId,receiverDesignation,receiverName,status,receiverProfile_picture
    let data = {
        senderProfileId: request.query.profileId,
        senderDesignation: request.query.role,
        receiverProfileId: request.body.receiverProfileId,
        receiverDesignation: request.body.receiverDesignation
    }
    getsenderReceiverDetails(data).then(function (result) {
        console.log('result ', result)
        data.senderName = result.senderName;
        data.senderProfile_picture = result.senderProfile_picture;
        data.receiverName = result.receiverName;
        data.receiverProfile_picture = result.receiverProfile_picture;
        data.status = 'Sent';
        requestdata = new FriendRequest(data);
        requestdata.save(function (error, sentrequest) {
            console.log('wrror ', error, sentrequest)
            if (error) {
                response.status(200).json({
                    error: true,
                    message: 'Error',
                    data: error
                })
            }
            else {
                updateSocialId(result, sentrequest._id).then(function (result) {
                    console.log(result)

                    // create notificationaa
                    let notificationData = new notification({
                        title: data.senderName + ' sent you a friend request.',
                        profileId: data.senderProfileId,
                        designation: data.senderDesignation,
                        profile_picture: data.senderProfile_picture,
                        noti_receiver: [{
                            profileId: request.body.receiverProfileId,
                            designation: request.body.receiverDesignation
                        }]
                    });
                    notificationData.save(function (error, notificationresult) {
                        console.log('notification', error, notificationresult)
                        if (error) {
                            response.status(200).json({
                                error: true,
                                message: 'Error',
                                data: error
                            })
                        } else {
                            response.status(200).json({
                                error: false,
                                message: 'Friend Request Sent.',
                                data: sentrequest
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

async function getsenderReceiverDetails(data) {
    let newdata = {}
    await Promise.all([getProfileDetails(data.senderDesignation, data.senderProfileId),
    getProfileDetails(data.receiverDesignation, data.receiverProfileId)]).then(function (values) {
        console.log('VALUES ', values)
        newdata.senderName = values[0].user_id.first_name + ' ' + values[0].user_id.last_name;
        newdata.senderProfile_picture = values[0].profile_picture ? values[0].profile_picture : null;
        newdata.senderUserId = values[0].user_id._id;
        newdata.receiverName = values[1].user_id.first_name + ' ' + values[1].user_id.last_name;
        newdata.receiverProfile_picture = values[1].profile_picture ? values[1].profile_picture : null;
        newdata.receiverUserId = values[1].user_id._id;

    })
    return newdata
}

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

async function updateSocialId(result, frndId) {
    let data;
    await Promise.all([addRequestToSocial(result.senderUserId, frndId),
    addRequestToSocial(result.receiverUserId, frndId)]).then(function (values) {
        console.log('values ', values)
        data = values
    })
    return data
}

async function addRequestToSocial(userid, frndId) {
    return new Promise(function (resolve, reject) {
        Social.findOneAndUpdate({ user_id: userid }, { $addToSet: { friendRequests: frndId } }, { new: true }, function (error, updated) {
            console.log('erre ', error, updated)
            if (error) {
                reject(error)
            } else {
                resolve(updated)
            }
        })
    })

}



//accept,reject or revoke a friend request
router.put('/action', function (request, response) {
    //friendrequest id
    FriendRequest.findOneAndUpdate({ _id: request.body.id }, { "$set": { status: request.body.action } }, { new: true }, function (error, success) {
        console.log('jhhjk', error, success)
        if (error) {
            response.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        } else {
            getProfileDetails(request.query.role, request.query.profileId).then(function (profiledetail) {
                console.log('profile deatils ', profiledetail)
                let action=request.body.action=='Accept'?'Accepted':request.body.action=='Reject'?'Rejected':request.body.action=='Revoke'?'Revoked':'Ignored'
                let notificationData = new notification({
                    title: profiledetail.user_id.first_name + ' ' + profiledetail.user_id.last_name + ' has ' + action + ' friend request.',
                    profileId: profiledetail._id,
                    designation: profiledetail.user_id.designation,
                    profile_picture: profiledetail.profile_picture ? profiledetail.profile_picture : null,
                    noti_receiver:request.body.action== 'Accept'|| 'Reject'?[{profileId:success.senderProfileId,designation:success.senderDesignation}]:[{profileId:success.receiverProfileId,designation:success.receiverDesignation}]
                })
                notificationData.save(function (error, notificationresult) {
                    console.log('notification', error, notificationresult)
                    if (error) {
                        response.status(200).json({
                            error: true,
                            message: 'Error',
                            data: error
                        })
                    } else {
                        response.status(200).json({
                            error: false,
                            message: 'Friend Request Updated ',
                            data: success
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



        }

    })

})
module.exports = router;