const express = require('express')
const router = express.Router();
const Requirements = require('./../models/requirements.mode');

router.post('/post', function (req, res) {
    req.body.author_id = req.query.profileId;
    req.body.author_role = req.query.role;
    let requirements_collection = new Requirements(req.body);
    requirements_collection.save(function (error, succes) {
        if (!error && succes != null) {
            res.status(200).json({
                error: false,
                message: 'Requirement has been posted',
                data: {}
            })
        } else {
            res.status(200).json({
                error: true,
                message: 'Requirement can not be posted',
                data: error
            })
        }
    });
})


router.put('/update', function (req, res) {
    let query = {
        author_id: req.query.profileId,
        author_role: req.query.role,
        status: 'pending',
        _id: req.query._id
    }

    Requirements.findOneAndUpdate(query, { $set: req.body }, function (error, succes) {
        if (!error && succes != null) {
            res.status(200).json({
                error: false,
                message: 'Requirement has been updated',
                data: {}
            })
        } else {
            res.status(200).json({
                error: true,
                message: 'Requirement can not be updated',
                data: error
            })
        }
    });
})

router.put('/markcompleted', function (req, res) {
    let query = {
        author_id: req.query.profileId,
        author_role: req.query.role,
        status: 'pending',
        _id: req.query._id
    }

    Requirements.findOneAndUpdate(query, { $set: { status: 'completed' } }, function (error, succes) {
        if (!error && succes != null) {
            res.status(200).json({
                error: false,
                message: 'Requirement has been marked as Completed',
                data: {}
            })
        } else {
            res.status(200).json({
                error: true,
                message: 'Requirement can not be marked',
                data: error
            })
        }
    });
})

router.get('/getmine', async function (req, res) {
    let author_id = req.query.profileId;
    let author_role = req.query.role;
    let query = {
        author_id: author_id,
        author_role: author_role
    }

    console.log(query)

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let resPerPage = req.query.perpage ? parseInt(req.query.perpage) : 10;
    let numOfRequirements = await Requirements.estimatedDocumentCount(query);
    let numOfPages = Math.ceil(numOfRequirements / resPerPage);

    Requirements.find(query).skip((resPerPage * page) - resPerPage)
        .limit(resPerPage).exec(function (error, succes) {
            if (!error && succes != null) {
                res.status(200).json({
                    error: false,
                    message: 'Requirements list',
                    data: succes,
                    page: page,
                    numOfPages: numOfPages
                })
            } else {
                res.status(200).json({
                    error: true,
                    message: 'Requirements not available',
                    data: error
                })
            }
        });
})


router.get('/get', async function (req, res) {
    let author_id = req.query.profileId;
    let author_role = req.query.role;
    let query = {
        status: 'pending',
        for: author_role,
        author_id: { $ne: author_id },
        author_role: { $ne: author_role }
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let resPerPage = req.query.perpage ? parseInt(req.query.perpage) : 10;
    let numOfRequirements = await Requirements.count(query);
    let numOfPages = Math.ceil(numOfRequirements / resPerPage);

    Requirements.find(query).skip((resPerPage * page) - resPerPage)
        .limit(resPerPage).exec(function (error, succes) {
            if (!error && succes != null) {
                res.status(200).json({
                    error: false,
                    message: 'Requirements list',
                    data: succes,
                    page: page,
                    numOfPages: numOfPages
                })
            } else {
                res.status(200).json({
                    error: true,
                    message: 'Requirements not available',
                    data: error
                })
            }
        });
})

module.exports = router;