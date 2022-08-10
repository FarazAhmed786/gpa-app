
//***** Modules goes here *****//
const express = require('express');
const auth = require('../../middleware/auth');
const axios = require("axios");
var qs = require('qs');

const app = express();

app.get('/', auth, async (req, res) => {
    try {
        await executePayment()
            .then((result) => {

                let dataObj = {
                    amount: 5,
                    currency: 'USD',
                    access_token: result.access_token
                }

                console.log(dataObj)

                var success = {
                    success: true,
                    msg: 'Payment session created successfully!',
                    data: dataObj
                };

                res.send(success);
                return;
            })
            .catch((ex) => {
                res.status(500).send(ex);
                return;
            })
    }
    catch (ex) {
        res.status(500).send(ex);
        return;
    }
});


//***** Validate Payment Data *****//
async function executePayment() {
    return new Promise(async (resolve, reject) => {
        let url = `https://api-m.sandbox.paypal.com/v1/oauth2/token`;

        axios.post(url,
            qs.stringify({
                'grant_type': 'client_credentials'
            }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            auth: {
                username: process.env.PAYPAL_USERNAME,
                password: process.env.PAYPAL_PASS
            }
        })
            .then(response => {
                // console.log(response)
                resolve(response.data)
            })
            .catch(error => {
                console.log(error.response)
                reject(error)
            });
    })
}

module.exports = app;