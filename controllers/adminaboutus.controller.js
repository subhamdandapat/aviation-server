const express = require('express');
const router = express.Router();
const AboutUs = require('./../models/adminaboutus.model');


//ADD ABOUT US 
router.post('/add', function (request, response) {
    let data = {
        text: request.body.text
    }
    if (request.body.image) {
        data.image = request.body.image
    }
    requestdata = new AboutUs(data);
    requestdata.save(function (error, result) {
        if (error) {
            response.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        } else {
            response.status(200).json({
                error: false,
                message: 'About Us added Successfully.',
                data: result
            })
        }
    })
})

// GET LIST OF ABOUT US
router.get('/list', function (request, response) {
    AboutUs.find({}, function (error, result) {
        if (error) {
            response.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        }
        else {
            response.status(200).json({
                error: false,
                message: 'About Us list get Successfully.',
                data: result
            })
        }
    })
})

module.exports = router;