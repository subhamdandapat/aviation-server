const express = require('express');
const router = express.Router();
const Users = require('./../models/users.model');
const Pilots = require('./../models/pilot.model');
const Mechanic = require('./../models/mechanic.model');
const Attendant = require('./../models/attendant.model');
const Social = require('./../models/social.model');
const helper = require('./../helpers/email.helper');
const bcrypt = require("bcryptjs");
const EmailHelper = require('./../helpers/email.helper');
const jwthelper = require('./../helpers/token.helper');
const moment = require('moment')
router.post('/register', function (req, res) {
    bcrypt.hash(req.body.password, 8, (err, hashedPassword) => {
        req.body.password = hashedPassword;
        let user_document = new Users(req.body);
        user_document.save(function (error, success) {
            if (!error && success != null) {
                req.body.user_id = success._id;
                createProfile(req.body)
                    .then(function (success) {
                        let email = req.body.email;
                        let url = "http://13.232.204.248:3000/verify?_id=" + req.body.user_id
                        EmailHelper.sendEmail(email, 'You have been registered successfully', "<p>You have been registered.Click <a href='" + url + "'>here </a> to verify email</p>");
                        res.status(200).json({
                            error: false,
                            message: 'You have been registered',
                            data: success
                        })
                    }, function (error) {
                        Users.remove({
                            _id: req.body.user_id
                        })
                        res.status(200).json({
                            error: true,
                            message: 'Can not create profile',
                            data: error
                        })
                    });
            } else {
                res.status(200).json({
                    error: true,
                    message: "Please try with another email or contact PJP Support. This email " + req.body.email + " is currupted",
                    data: error
                })
            }
        })
    })
});


function createProfile(profile) {
    let profile_document;
    return new Promise(function (resolve, reject) {
        if (profile.designation == 'Pilot') {
            profile_document = new Pilots(profile)
        } else if (profile.designation == 'Flight Attendant') {
            profile_document = new Attendant(profile)
        } else if (profile.designation == 'Mechanic') {
            profile_document = new Mechanic(profile)
        }
        profile_document.save(function (error, success) {
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        });
    });
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

function getProfileByProfileId(role, user_id) {
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
            _id: user_id
        }, function (error, success) {
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })
    });
}


router.post('/login', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let client = {
        agent: req.header('user-agent'), // User Agent we get from headers
        referrer: req.header('referrer'), //  Likewise for referrer
        ip: req.header('x-forwarded-for') || req.connection.remoteAddress, // Get IP - allow for proxy
    };
    Users.findOne({
        email: email,
    }, function (error, success) {
        if (!error && success != null) {
            let hashedPassword = success.password;
            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    res.status(200).json({
                        error: true,
                        message: 'Wrong credentials',
                        data: {}
                    })
                } else if (isMatch) {
                    let verified = success.verified;
                    if (verified) {
                        let designation = success.designation;
                        let user_id = success._id;
                        getProfile(designation, user_id)
                            .then(function (profile) {
                             
                                // with JWT
                                jwthelper.generateToken(profile._id, success.designation, client.ip, client.agent)
                                    .then(function (success) {
                                        res.status(200).json({
                                            error: false,
                                            message: 'User logged in successfully',
                                            data: success.token
                                        })
                                    });
                            }, function (error) {
                                res.status(200).json({
                                    error: true,
                                    message: 'Wrong Credentials',
                                    data: error
                                })
                            });
                    } else {
                        res.status(200).json({
                            error: true,
                            message: 'Please verify your email id',
                            data: {}
                        })
                    }
                } else {
                    res.status(200).json({
                        error: true,
                        message: 'Wrong credentials',
                        data: {}
                    })
                }
            });
        } else {
            res.status(200).json({
                error: true,
                message: 'Wrong credentials',
                data: {}
            })
        }
    })
})

router.post('/requestpasswordchange', function (req, res) {
    let email = req.body.email;
    if (!email) {
        res.status(200).json({
            error: true,
            message: 'Provide a valid email address',
            data: {}
        })
    } else {
        let client = {
            agent: req.header('user-agent'), // User Agent we get from headers
            referrer: req.header('referrer'), //  Likewise for referrer
            ip: req.header('x-forwarded-for') || req.connection.remoteAddress, // Get IP - allow for proxy
        };
        findUserByEmail(email)
            .then(function (user) {
                getProfile(user.designation, user._id)
                    .then(function (profile) {

                        jwthelper.generateToken(profile._id, user.designation, client.ip, client.agent)
                            .then(function (success) {
                                let passwordurl = 'http://pjp.brainless.online/#/password/reset?webtoken=' + success.token + '&agent=' + client.agent + '&ip=' + client.ip
                                EmailHelper.sendEmail(email, 'Password Reset Email', "<p>Dear Mr./Mrs./Ms. " + user.last_name + ", click <a href='" + passwordurl + "'>here </a> to reset password.</p>");
                                res.status(200).json({
                                    error: false,
                                    message: 'Password reset email has been set to ' + email + '. Please check your email.',
                                    data: {}
                                })
                            });
                    }, function (error) {
                        res.status(200).json({
                            error: true,
                            message: 'User not found with this email : ' + email,
                            data: {}
                        })
                    });
            }, function (error) {
                res.status(200).json({
                    error: true,
                    message: 'User not found with this email : ' + email,
                    data: {}
                })
            });
    }
})

router.put('/changepassword', function (req, res) {
    let password = req.body.password;
    let confirmpassword = req.body.confirmpassword;
    let token = req.body.token;
  
    if (!password || !confirmpassword) {
        res.status(200).json({
            error: true,
            message: 'Please provide both password and confirm password',
            data: {}
        })
    } else if (password != confirmpassword) {
        res.status(200).json({
            error: true,
            message: 'Passwords do not match',
            data: {}
        })
    } else {
        bcrypt.hash(req.body.password, 8, (err, hashedPassword) => {
            if (err) {
                res.status(200).json({
                    error: true,
                    message: 'Password format is not valid',
                    data: {}
                })
            } else {
                const JWTSchema = require('./../models/jwt.model');
                JWTSchema.findOne({
                    token: token
                }, function (error, success) {
                    if (!error && success != null) {
                        let userId = success.userId;
                        let role = success.role;
                        getProfileByProfileId(role, userId)
                            .then(function (success) {
                                Users.findOneAndUpdate({
                                    _id: success.user_id
                                }, { $set: { password: hashedPassword } }, function (error, success) {
                                 
                                    if (!error && success != null) {
                                        res.status(200).json({
                                            error: false,
                                            message: 'Password has been reset successfully. ',
                                            data: {}
                                        })
                                    } else {
                                        res.status(200).json({
                                            error: true,
                                            message: 'This email may be invalid. Please make a fresh password reset request.',
                                            data: {}
                                        })
                                    }
                                })
                            }, function (error) {
                                res.status(200).json({
                                    error: true,
                                    message: 'This email may be invalid. Please make a fresh password reset request.',
                                    data: {}
                                })
                            })
                    } else {
                        res.status(200).json({ error: true, message: 'Unauthorized', data: {} });
                        // throw new Error("Not Authorized");
                    }
                })
            }
        })
    }
})

function findUserByEmail(email) {
    return new Promise(function (resolve, reject) {
        Users.findOne({
            email: email
        }, function (error, success) {
            if (!error && success != null) {
                resolve(success)
            } else {
                reject(error)
            }
        })
    });
}

router.post('/refreshtoken', function (req, res) {
    const JWTSchema = require('./../models/jwt.model');
    let token = req.body.token;
    let client = {
        agent: req.header('user-agent'), // User Agent we get from headers
        referrer: req.header('referrer'), //  Likewise for referrer
        ip: req.header('x-forwarded-for') || req.connection.remoteAddress, // Get IP - allow for proxy
    };
    JWTSchema.findOne({
        token: token,
        IPAddress: client.ip,
        platform: client.agent
    }, function (error, success) {
     
        if (!error && success != null) {
            jwthelper.generateToken(success.userId, success.role, success.IPAddress, success.platform)
                .then(function (success) {
                    res.status(200).json({
                        error: false,
                        message: 'Token has been refreshed successfully',
                        data: success.token
                    })
                });
        } else {
            res.status(200).json({ error: true, message: 'Unauthorized', data: {} });
        }
    })
})


router.post('/sociallogin', function (req, res) {
 
    let email = req.body.email;
    let password = req.body.password;
    let client = {
        agent: req.header('user-agent'), // User Agent we get from headers
        referrer: req.header('referrer'), //  Likewise for referrer
        ip: req.header('x-forwarded-for') || req.connection.remoteAddress, // Get IP - allow for proxy
    };
    Users.findOne({
        email: email,
    }, function (error, success) {
        if (!error && success != null) {
            let hashedPassword = success.password;
            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    res.status(200).json({
                        error: true,
                        message: 'Wrong credentials',
                        data: {}
                    })
                } else if (isMatch) {
                    let verified = success.verified;
                    if (verified) {
                        let designation = success.designation;
                        let user_id = success._id;
                        getProfile(designation, user_id)
                            .then(function (profile) {
                             
                                //check whether user is present on social or not
                                Social.findOne({ user_id: user_id }, function (error, success) {
                                    
                                    if (error) {
                                        res.status(200).json({
                                            error: true,
                                            message: 'Wrong Credentials',
                                            data: error
                                        })
                                    } else if (success != null) {
                                        // login   
                                        // with JWT
                                        jwthelper.generateToken(success._id, designation, client.ip, client.agent)                //id of social to generate token
                                            .then(function (success) {
                                                res.status(200).json({
                                                    error: false,
                                                    message: 'User logged in successfully',
                                                    data: success.token
                                                })
                                            });
                                    } else if (success == null) {
                                        //store userid and joining date then login

                                        let data = {
                                            user_id: user_id,
                                            joined_date: moment()
                                        }
                                        let social_profile = new Social(data)
                                        social_profile.save(function (error, success) {
                                            if (error) {
                                                res.status(200).json({
                                                    error: true,
                                                    message: 'Wrong Credentials',
                                                    data: error
                                                })
                                            } else {
                                                //login
                                                // with JWT
                                                jwthelper.generateToken(success._id,designation, client.ip, client.agent)           //id of social to generate token
                                                    .then(function (success) {
                                                        res.status(200).json({
                                                            error: false,
                                                            message: 'User logged in successfully',
                                                            data: success.token
                                                        })
                                                    });
                                            }

                                        })
                                    }

                                })

                            }, function (error) {
                                res.status(200).json({
                                    error: true,
                                    message: 'Wrong Credentials',
                                    data: error
                                })
                            });
                    } else {
                        res.status(200).json({
                            error: true,
                            message: 'Please verify your email id',
                            data: {}
                        })
                    }
                } else {
                    res.status(200).json({
                        error: true,
                        message: 'Wrong credentials',
                        data: {}
                    })
                }
            });
        } else {
            res.status(200).json({
                error: true,
                message: 'Wrong credentials',
                data: {}
            })
        }
    })
})
module.exports = router;