const express = require('express')
const app = express()
const port = 3000
const jwt = require('jsonwebtoken');
const fs = require('fs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const Users = require('./models/users.model');

mongoose.connect('mongodb://127.0.0.1:27017/cloud', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
});
mongoose.connection.on('connected', () => {
    console.log("Database connected");
});
mongoose.connection.on('error', (err) => { if (err) { } });

app.get('/jwt', (req, res) => {
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let token = jwt.sign({ "user": "pushpendu.ghosh@mefy.care" }, privateKey, { algorithm: 'HS256' });
    res.send(token);
})

function isAuthenticated(req, res, next) {
    const JWTSchema = require('./models/jwt.model');
    if (typeof req.headers.authorization !== "undefined") {
        console.log("Authorization")
        // retrieve the authorization header and parse out the
        // JWT using the split function
        let token = req.headers.authorization.split(" ")[1];
        console.log(token)
        let privateKey = fs.readFileSync('./private.pem', 'utf8');
        // Here we validate that the JSON Web Token is valid and has been 
        // created using the same private pass phrase
        jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
            // if there has been an error...
            if (err) {
                console.log(err)
                // shut them out!
                res.status(200).json({ error: true, message: 'Unauthorized', data: {} });
                throw new Error("Not Authorized");
            } else {
                JWTSchema.findOne({
                    token: token
                }, function (error, success) {
                    console.log(error, success)
                    if (!error && success != null) {
                        let userId = success.userId;
                        let role = success.role;
                        req.query.profileId = userId;
                        req.query.role = role;
                        console.log("==========", success)
                        next();
                    } else {
                        res.status(200).json({ error: true, message: 'Unauthorized', data: {} });
                        throw new Error("Not Authorized");
                    }
                })
            }

            // if (user.user != 'pushendu.ghosh@mefy.care') {
            //     res.status(200).json({ error: true, message: 'Unauthorized', data: {} });
            //     throw new Error("Not Authorized");
            // }
            // if the JWT is valid, allow them to hit
            // the intended endpoint
        });
    } else {
        // No authorization header exists on the incoming
        // request, return not authorized and throw a new error 
        res.status(200).json({ error: true, message: 'Unauthorized', data: {} });
        throw new Error("Not Authorized");
    }
}

const UserRoutes = require('./controllers/users.controller');
const ImageRoute = require('./controllers/image.controller');
const ProfileRoute = require('./controllers/profile.controler');
const SearchRoute = require('./controllers/search.controller');
const InstaRoute = require('./controllers/instagram.controller');

app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.get('/verify', function (req, res) {
    let user_id = req.query._id;
    // res.send('User not Verified!')
    Users.findOneAndUpdate({
        _id: user_id
    }, { $set: { verified: true } }, function (error, success) {
        if (!error && success != null) {
            res.send('User Verified!')
        } else {
            res.send('User not Verified!')
        }
    })
})

app.use('/image', ImageRoute);
app.use('/users', UserRoutes);
app.use('/profile', isAuthenticated, ProfileRoute);
app.use('/search', SearchRoute);
app.use('/instagram', InstaRoute);

app.get('/hello', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`PJP Cloud APIs listening at PORT -> ${port}`))