const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.HOSTEMAIL,
  // port: 465,
  // secure: false,
  auth: {
    user: process.env.USERGMAIL,
    pass: process.env.PASSWORDGMAIL,
  },
  tls: {
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