const express = require('express')
const app = express()
const port = 3000
const jwt = require('jsonwebtoken');
const fs = require('fs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const Users = require('./models/users.model');

mongoose.connect('mongodb://127.0.0.1:27017/cloud');
mongoose.connection.on('connected', () => { });
mongoose.connection.on('error', (err) => { if (err) { } });

app.get('/jwt', (req, res) => {
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let token = jwt.sign({ "user": "pushpendu.ghosh@mefy.care" }, privateKey, { algorithm: 'HS256' });
    res.send(token);
})

function isAuthenticated(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization.split(" ")[1];
        let privateKey = fs.readFileSync('./private.pem', 'utf8');
        jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
            if (err) {
                res.status(401).json({ error: true, message: 'Unauthorized', data: {} });
                throw new Error("Not Authorized");
            }
            return next();
        });
    } else {
        res.status(401).json({ error: true, message: 'Unauthorized', data: {} });
        throw new Error("Not Authorized");
    }
}

const UserRoutes = require('./controllers/users.controller');
const ImageRoute = require('./controllers/image.controller');

app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.get('/verify', function (req, res) {
    let user_id = req.query._id;
    // res.send('User not Verified!')
    Users.findOneAndUpdate({
        _id: user_id
    },{$set:{verified:true}}, function (error, success) {
        if (!error && success != null) {
            res.send('User Verified!')
        } else {
            res.send('User not Verified!')
        }
    })
})

// app.use(isAuthenticated)

app.use('/image',isAuthenticated, ImageRoute);
app.use('/users',isAuthenticated, UserRoutes);
app.get('/hello', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))