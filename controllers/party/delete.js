
//***** Modules goes here *****//
const express = require('express');
const { PartyData } = require('../../Models/party.model');
const { UserData } = require('../../Models/user.model');
const { ConversationData } = require('../../Models/conversation.model');
const auth = require('../../middleware/auth');

const app = express();

app.delete('/', auth, async (req, res) => {

    if (req.query.partyId == null) {
        var err = {
            success: false,
            msg: 'Please enter valid Party ID!'
        };
        res.status(500).send(err);
        return;
    }

    await deleteParty(req)
        .then(() => {
            var success = {
                success: true,
                msg: 'Party deleted successfully!'
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


async function deleteParty(req) {
    return new Promise(async (resolve, reject) => {
        const user = await UserData.findOne({ _id: req.user._id });

        const party = await PartyData.findOne({
            _id: req.query.partyId,
            "members.phone": user.mobile,
            "members.isOwner": true
        });

        if (party == null) {
            var err = {
                msg: 'Party doesnt exist OR you do not have permission to delete it!'
            };
            reject(err);
        }

        party.members.map(async (pty) => {

            if (pty.phone === user.mobile) {
                await PartyData.findOneAndDelete({
                    _id: req.query.partyId
                }, async (err, result) => {
                    if (err) {
                        reject(err);
                    }

                    await ConversationData.findOneAndDelete({
                        partyId: req.query.partyId
                    },
                        async err => {
                            if (err) {
                                reject(err);
                            }
                        })
                    resolve(result);
                });
            }
        })
    })
}

module.exports = app;
