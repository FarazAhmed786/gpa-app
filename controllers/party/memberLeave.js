
//***** Modules goes here *****//
const express = require('express');
const { PartyData } = require('../../Models/party.model');
const { UserData } = require('../../Models/user.model');
const auth = require('../../middleware/auth');

const app = express();

app.put('/', auth, async (req, res) => {

    if (req.query.partyId == null) {
        var err = {
            success: false,
            msg: 'Please enter valid Party ID!'
        };
        res.status(500).send(err);
        return;
    }

    await memberLeave(req)
        .then(() => {
            var success = {
                success: true,
                msg: 'You have left this party successfully!'
            };
            res.send(success);
            return;
        })
        .catch((ex) => {
            var err = {
                success: false,
                msg: 'There was an error!',
                data: ex
            };
            res.status(500).send(err);
            return;
        });

});


async function memberLeave(req) {
    return new Promise(async (resolve, reject) => {
        const user = await UserData.findOne({ _id: req.user._id });

        const party = await PartyData.findOne({
            _id: req.query.partyId,
            "members.phone": user.mobile
        });

        if (party == null) {
            var err = {
                msg: 'Party doesnt exist OR you are not a member of it!'
            };
            reject(err);
        }

        await PartyData.findOneAndUpdate({
            _id: req.query.partyId,
            "members.phone": user.mobile
        },
            {
                $set: {
                    "members.$.status": 3,
                }
            },
            async (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
    })
}

module.exports = app;
