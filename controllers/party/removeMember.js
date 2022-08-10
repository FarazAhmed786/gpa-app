
//***** Modules goes here *****//
const express = require('express');
const { PartyData } = require('../../Models/party.model');
const { UserData } = require('../../Models/user.model');
const auth = require('../../middleware/auth');
const { ConversationData } = require('../../Models/conversation.model');

const app = express();

app.put('/', auth, async (req, res) => {

    if (req.body.partyId == null) {
        var err = {
            success: false,
            msg: 'Please enter valid Party ID!'
        };
        res.status(500).send(err);
        return;
    }

    await removeMember(req)
        .then((party) => {
            var success = {
                success: true,
                msg: 'Member removed successfully!',
                data: party
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


async function removeMember(req) {
    return new Promise(async (resolve, reject) => {
        const user = await UserData.findOne({ _id: req.user._id });

        const party = await PartyData.findOne({
            _id: req.body.partyId,
            "members.phone": user.mobile,
            "members.isOwner": true
        });

        if (party == null) {
            var err = {
                msg: 'Party doesnt exist OR you do not have permission to delete it!'
            };
            reject(err);
        }

        const getPartyMembers = await PartyData.findOne({ _id: req.body.partyId });

        let party_member = [];
        getPartyMembers.members.filter((x) => {
            if (x.phone != req.body.phone) {
                party_member.push(x);
            }
        })

        let objToUpdate = {
            members: party_member
        }

        await PartyData.findByIdAndUpdate(
            req.body.partyId,
            objToUpdate,
            async err => {
                if (err) {
                    reject(err);
                }

        const member = await UserData.findOne({ mobile: req.body.phone });

        await ConversationData.findOneAndUpdate({partyId: req.body.partyId},
            { [member._id]: false },
            async err => {
                if (err) {
                    reject(err);
                }
            });

        const party = await PartyData.findOne({ _id: req.body.partyId });
        resolve(party);
        });
    })
}

module.exports = app;
