//***** Modules goes here *****//
var _ = require('lodash');
const express = require('express');
const bcrypt = require('bcryptjs');
const { UserData } = require('../../Models/user.model');
const { Token } = require('../../Models/token.user.model');
const nodemailer = require('nodemailer');
var async = require('async');
const sgMail = require('@sendgrid/mail');
const app = express();



function generateOTP() {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
  sgMail.setApiKey(
    "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"
  );
app.post('/', function (req, res, next) {
    console.log(req.body)
    async.waterfall([
        function (done) {
            var token = generateOTP();
            done(null,token)

        },
        function (token, done) {
            UserData.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    res.send({success:false, msg:'error No account with that email address exists.'});
                    //   return res.redirect('/forgot');
                }
                else if (user) {

                    // res.status(200).send("found");
                    var smtpTransport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'abdulahadnara1996@gmail.com',
                            pass: 'qadirbhai12'
                        }
                    });
                    var mailOptions = {
                        to: req.body.email,
                        from: 'info@Convey.com',
                        subject: 'Convey Password Reset',
                        text: 'Your code for reset password is ==> ' + token,
                        html: '<strong>'+token + '</strong>',
                    };

                    sgMail.send(mailOptions,
                         function (err) {

                        if (err) {
                            console.log(err)
                            res.status(403).send(err);
                        }
                        else {
                            createToken({
                                _userId: user._id,
                                token: token,
                                createdAt: Date.now()
                            }).then((response => {
                                if (response === 500) {
                                    res.status(403).send("error");
                                }
                                else if (response === 200) {
                                    res.send({ success: true, msg:"check your email "+ req.body.email, userId: user._id });
                                }
                            }));
                        }



                    });
                }


            });
        },
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

async function createToken(token) {
    const gettoken = new Token(token);

    try {
        const result = await gettoken.save();
    }
    catch (ex) {
        console.log(ex.code);
        return (500);
    }
    return (200);
    // });
}

module.exports = app;