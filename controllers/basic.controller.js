const express = require("express");
const router = express.Router();
const http = require("http");
const basic = require('./../json/basic.json');
const countries = require('./../json/countries.json');

router.get('/icao',function(req,res){
    let search_String = req.query.search;
    let url = "https://www.privatejetpilots.com/wp-content/themes/pjp/ajax/registration_ajax.php?%3E&q%5Bterm%5D="+search_String+"&q%5B_type%5D=query&action=icao_code_list";
    var options = {
        host: "http://www.privatejetpilots.com",
        port: 80,
        path: "/wp-content/themes/pjp/ajax/registration_ajax.php?%3E&q%5Bterm%5D="+search_String+"&q%5B_type%5D=query&action=icao_code_list",
        method: 'GET'
      };
      
      http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
      }).end();
})

router.get("/info",function(req,res){
    res.status(200).send({
        error:false,
        message:'Registration basic informations',
        data:basic,
        countries:countries
    })
})

module.exports = router;