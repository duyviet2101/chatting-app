const nodemailer = require('nodemailer');

module.exports.sendMail = (to, subject, html) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_NODEMAILER,
      pass: process.env.PASSWORD_NODEMAILER
    }
  });
  // setup email data with unicode symbols
  let mailOptions = {
    from: '"ConnectMe" <tranduyviet21012004a@gmail.com>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.response);
  });
};