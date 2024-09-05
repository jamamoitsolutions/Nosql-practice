const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.Email_Host, // email host
  port: process.env.Email_SMTP_Port, // smtp port
  secureConnection: false,
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.Email_ID, // email user
    pass: process.env.Email_Pass, // email password
  },
});

module.exports = transporter;
