const express = require('express');
const router = express.Router();
const Users = require('../models/users.model');
const Pilots = require('../models/pilot.model');
const Mechanic = require('../models/mechanic.model');
const Attendant = require('../models/attendant.model');
const helper = require('../helpers/email.helper');
const bcrypt = require("bcryptjs");
const EmailHelper = require('../helpers/email.helper');
const jwthelper = require('../helpers/token.helper');

router.get('/crew', async function (req, res) {
    let designation = req.query.designation;
    let query = {
        verified: true
    };
    if (designation) {
        query.designation = designation
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let resPerPage = req.query.perpage ? parseInt(req.query.perpage) : 10;
    let numOfCrews = await Users.count(query);
    let numOfPages = Math.ceil(numOfCrews / resPerPage);

    Users.find(query).skip((resPerPage * page) - resPerPage)
        .limit(resPerPage).exec(async function (error, success) {
            if (!error && success != null) {
                let users = await getUsersProfile(success);
                res.status(200).json({
                    error: false,
                    message: 'Crew found',
                    data: users,
                    page: page,
                    numOfPages: numOfPages
                })
            } else {
                res.status(200).json({
                    error: false,
                    message: 'No Crew found',
                    data: []
                })
            }
        })
})

async function getUsersProfile(users) {
    for (let i = 0; i <= users.length - 1; i++) {
        let profile = await getProfile(users[i].designation, users[i]._id);
        users[i] = profile;
        if (i == users.length - 1) {
            return users;
        }
    }
}

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
            user_id: user_id
        }, function (error, success) {
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })
    });
}

module.exports = router;