
//***** Modules goes here *****//
const express = require('express');
const auth = require('../../middleware/auth');
const Joi = require('joi');
const app = express();
var paypal = require('paypal-rest-sdk');
const { PaymentData } = require('../../Models/payment.model');

paypal.configure({
    'mode': process.env.PAYPAL_MODE,
    "client_id": process.env.TEST_CLIENT_ID,
    "client_secret": process.env.TEST_CLIENT_SECRET
});


app.post('/', auth, async (req, res) => {
    const { error } = validateApiData(req.body);

    if (error) {
        var errors = {
            success: false,
            msg: error.name,
            data: error.details[0].message
        };
        res.status(403).send(errors);
        return;
    }

    try {

        await verifyPayment(req.body.paymentId, req.body.paymentDetails)
            .then(async () => {
                await createPayment(req)
                    .then((result) => {
                        var success = {
                            success: true,
                            msg: 'Payment verified successfully!',
                            data: result
                        };

                        res.send(success);
                        return;
                    })
            })
            .catch(ex => {
                res.status(500).send(ex);
                return;
            });
    }
    catch (ex) {
        res.status(500).send(ex);
        return;
    }
});


//***** Verify Payment Data *****//
async function verifyPayment(paymentId, obj) {
    return new Promise((resolve, reject) => {
        paypal.payment.execute(paymentId, obj, function (error, payment) {
            if (error) {
                console.log(error.response);
                reject(error);
            } else {
                // console.log("Payment Response");
                resolve(JSON.stringify(payment));
            }
        });
    })
}


//***** Verify Payment Data *****//
async function createPayment(req) {
    return new Promise((resolve, reject) => {
        try {
            req.body.userId = req.user._id;
            const payment = new PaymentData(req.body);
            const result = payment.save();
            resolve(result);
        }
        catch (err) {
            reject(err);
        }
    })
}


function validateApiData(body) {
    const schema = Joi.object().keys({
        paymentId: Joi.string().required(),
        paymentDetails: Joi.object({
            payer_id: Joi.string().required(),
            transactions: Joi.array().items(
                Joi.object({
                    amount: Joi.object({
                        currency: Joi.string().required(),
                        total: Joi.number().required()
                    })
                })
            ).required()
        }).required()
    });
    return Joi.validate(body, schema)
}


module.exports = app;