const express = require('express');
const router = express.Router();
const News = require('./../models/news.model');


//ADD NEWS
router.post('/add', function (request, response) {
    let data = {
        headline:request.body.headline,
        article:request.body.article,

    }
    if (request.body.image) {
        data.image = request.body.image
    }
    requestdata = new News(data);
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
                message: 'News added Successfully.',
                data: result
            })
        }
    })
})

// GET LIST OF NEWS
router.get('/list', function (request, response) {
    News.find({}, function (error, result) {
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
                message: 'News list get Successfully.',
                data: result
            })
        }
    })
})



//GET NEWS DETAIL BY ID
router.get('/single',function(request,response){
    let id=request.query.newsId;
    News.findById({_id:id},function(error,result){
        if(error){
            response.status(200).json({
                error: true,
                message: 'Error',
                data: error
            })
        }else{
            response.status(200).json({
                error: false,
                message: 'News detail got successfully.',
                data: result
            })
        }
    })
})
module.exports = router;