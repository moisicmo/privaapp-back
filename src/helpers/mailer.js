// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: process.env.HOSTEMAIL,
//   // port: 465,
//   // secure: false,
//   auth: {
//     user: process.env.USERGMAIL,
//     pass: process.env.PASSWORDGMAIL,
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });

// transporter.verify()
//   .then(() => {
//     console.log('Ready for send email');
//   })
//   .catch((err) => {
//     console.log(`err ${err}`);
//   })

// module.exports = {
//   transporter
// }

const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

const OAuth2_client = new OAuth2(process.env.IDCLIENT, process.env.SECRETCLIENT);

OAuth2_client.setCredentials({ refresh_token: process.env.REFRESHTOKEN });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    options: {
        debug: true
    },
    auth: {
        type: 'OAuth2',
        user: process.env.USERGMAIL,
        pass: process.env.PASSWORDGMAIL,
        clientId: process.env.IDCLIENT,
        clientSecret: process.env.SECRETCLIENT,
        refreshToken: process.env.REFRESHTOKEN,
        accessToken: OAuth2_client.getAccessToken(),
    },
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    tls: {
        secure: false,
        ignoreTLS: true,
        rejectUnauthorized: false
    }
});

transporter.verify()
    .then(() => {
        console.log('Ready for send email');
    })
    .catch((err) => {
        console.log(`err ${err}`);
    })

module.exports = {
    transporter
}