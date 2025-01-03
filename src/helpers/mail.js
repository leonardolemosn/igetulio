const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
    port: process.env.EMAIL_PORT,
    secure: false
});

const sendMail = function sendMail(to, subject, text) {
    const mailOptions = {
        from: 'naoresponda@igetulio.com',
        to,
        subject,
        text
    };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if(error) return reject(error);
            return resolve(info);
        });
    });
}

module.exports = {
    sendMail
};