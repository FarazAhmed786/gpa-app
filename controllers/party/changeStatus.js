
//***** Modules goes here *****//
const express = require('express');
const { UserData } = require("../../Models/user.model");
const Joi = require('joi');
const { PartyData } = require('../../Models/party.model');
const auth = require('../../middleware/auth');


const app = express();
app.put('/', auth,
    async (req, res) => {
        let { error } = validateData(req.body);
        if (error) {
            var errors = {
                success: false,
                msg: error.details[0].message,
                data: error.name,
            };
            res.status(400).send(errors);
            return;
        }

        if (req.query.partyId == null) {
            var errors = {
                success: false,
                msg: 'Please enter Party ID!'
            };
            res.status(400).send(errors);
            return;
        }

        const user = await UserData.findOne({ _id: req.user._id });

        // if(req.body.status == 1){       //accepted
        // await checkParty(req, user)
        //     .then(async () => {
        //         console.log('2')
        //         req.body.userId = req.user._id;
        //         await changeStatus(req, user)
        //             .then((result) => {
        //                 console.log('4')
        //                 var success = {
        //                     success: true,
        //                     msg: 'Party accepted!',
        //                     data: result
        //                 }
        //                 res.send(success);
        //                 return;
        //             })
        //             .catch(err => {
        //                 res.status(500).send(err);
        //                 return;
        //             });
        //     })
        //     .catch(err => {
        //         res.status(500).send(err);
        //         return;
        //     });
        // } else 
        // if(req.body.status == 2){ //rejected
            await changeStatus(req, user)
            .then((result) => {
                var success = {
                    success: true,
                    msg: 'Party rejected!',
                    data: result
                }
                res.send(success);
                return;
            })
            .catch(err => {
                res.status(500).send(err);
                return;
            });
        // }
    }
);


function validateData(body) {
    const schema = Joi.object().keys({
        latitude: Joi.string().required(),
        longitude: Joi.string().required(),
        status: Joi.number().required()
    });
    return Joi.validate(body, schema)
}

async function checkParty(req, user) {
    console.log('1')
    return new Promise(async (resolve, reject) => {

        await PartyData.findOneAndUpdate(
            {
                "members.phone": user.mobile,
                "members.status": 1 //accepted
            },
            {
                $set: {
                    "members.$.status": 3,
                }
            },
            async (err, result) => {
                resolve(result);
            }
        )
    });
}

async function changeStatus(req, user) {
    console.log('3')
    return new Promise(async (resolve, reject) => {
        await PartyData.findOneAndUpdate(
            { _id: req.query.partyId, "members.phone": user.mobile },
            {
                $set: {
                    "members.$.latitude": req.body.latitude,
                    "members.$.longitude": req.body.longitude,
                    "members.$.status": req.body.status,
                }
            },
            async (err, result) => {

                const response = await PartyData.findOne({ _id: result._id });
                resolve(response);
                reject(err);
            }
        );
    })
}

module.exports = app;