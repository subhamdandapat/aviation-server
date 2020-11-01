const nodemailer = require('nodemailer');
const sender = 'noreply.privatejetpilots@gmail.com'
const transporter = nodemailer.createTransport({
    tls: {
        rejectUnauthorized: false
    },
    host: "74.125.24.109",
    port: 587,
    secure: false,
    auth: {
        user: 'malajyoti9@gmail.com',
        pass: 'devnarayanpandit'
    }
});

class EmailHelper {
    sendEmail(to, subject, htmlcode) {
        return new Promise(function (resolve, reject) {
            const mailOptions = {
                from: sender,
                to: to,
                subject: subject,
                html: htmlcode
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(info)
                }
            });
        });
    }
}
module.exports = new EmailHelper();

