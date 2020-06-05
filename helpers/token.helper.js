const JWTSchema = require('./../models/jwt.model');
const jwt = require('jsonwebtoken');
const fs = require('fs')

class TokenHelper {
    generateToken(userId, role, IPAddress, platform) {
        return new Promise(function (resolve, reject) {
            let privateKey = fs.readFileSync('./private.pem', 'utf8');
            let token = jwt.sign({ "user": "pushpendu.ghosh@mefy.care" }, privateKey, { algorithm: 'HS256', expiresIn: '15m' });
            let jwtdata = {
                userId: userId,
                role: role,
                token: token,
                IPAddress: IPAddress,
                platform: platform,
                createdAt: new Date()
            };
            JWTSchema.updateOne({
                userId: userId
            }, { $set: jwtdata }, { upsert: true }, function (error, success) {
                if (!error && success != null) {
                    resolve({
                        token: token
                    })
                } else {
                    reject(error)
                }
            })
        });

    }
}
module.exports = new TokenHelper();

