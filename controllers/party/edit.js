const express = require("express");
const Joi = require("joi");
const fs = require("fs");
const auth = require("../../middleware/auth");
const { PartyData } = require("../../Models/party.model");
const { UserData } = require("../../Models/user.model");
const upload = require("../../constants/multer");
const cloudinary = require("../../constants/cloudinary");
//***** ///// *****//

//***** Express Router to export in module *****//
const app = express();
//***** ///// *****//

app.put('/',
    upload.fields([{ name: "image" }]),
    auth, async (req, res) => {

        if(req.body.members){
            req.body.members = JSON.parse(req.body.members);
        }
        
        const { error } = validateData(req.body);
        if (error) {
            console.log(error, 'error')
            var errors = {
                success: false,
                msg: error.details[0].message,
                data: error.name,
            };
            res.send(errors);
            return;
        }

        await editParty(req)
            .then((result) => {
                var success = {
                    success: true,
                    msg: 'Party edited successfully!',
                    data: result
                };
                res.send(success);
                return;
            })
            .catch((err) => {
                var errr = {
                    success: false,
                    msg: 'Something went wrong!',
                    data: err
                };
                res.send(errr);
                return;
            })
    });
//***** ///// *****//

function validateData(body) {
    const schema = Joi.object().keys({
        partyId: Joi.string().required(),
        event_name: Joi.string().required(),
        date: Joi.date().required(),
        from_time: Joi.string().regex(/\b((1[0-2]|0?[1-9]):([0-5][0-9]))/).required(),
        till_time: Joi.string().regex(/\b((1[0-2]|0?[1-9]):([0-5][0-9]))/).required(),
        latitude: Joi.string().required(),
        longitude: Joi.string().required(),
        members: Joi.array().items(
            Joi.object({
                phone: Joi.number().required(),
                isOwner: Joi.boolean().required(),
                latitude: Joi.string().optional(),
                longitude: Joi.string().optional(),
                status: Joi.number().optional()
            })
        ).optional(),
        paymentId: Joi.string().optional(),
        isSubscribed: Joi.string().optional()
    });
    return Joi.validate(body, schema)
}

async function editParty(req) {
    return new Promise(async (resolve, reject) => {

        const user = await UserData.findOne({ _id: req.user._id });

        if (req.files.image != null) {
            const image = async (path) => await cloudinary.uploads(path, "partyImage");
            const img = req.files.image[0];
            const { path } = img;
            const imgURL = await image(path);
            fs.unlinkSync(path);
            req.body.image = imgURL.url;
        }

        if (req.body.members) {

            const partyMembers = await PartyData.findOne({
                _id: req.body.partyId,
                "members.phone": user.mobile,
                "members.isOwner": true
            })

            if (partyMembers == null) {
                var err = {
                    success: false,
                    msg: 'Party not found!'
                }
                reject(err);
            }

            var member_arr1 = partyMembers.members;
            var member_arr2 = req.body.members;
            var member_arr = member_arr1.concat(member_arr2);

            const unique = []
            member_arr.filter(o => {
                if (unique.find(i => i.phone === o.phone)) {
                    return true
                }
                unique.push(o)
                return false;
            });

            req.body.members = unique;
        }

        await PartyData.findOneAndUpdate(
            {
                _id: req.body.partyId,
                "members.phone": user.mobile,
                "members.isOwner": true
            },
            req.body,
            async (err, result) => {
                if (err) {
                    reject(err);
                }

                var party = await PartyData.findById(result._id);
                resolve(party);
            }
        );
    })
}

module.exports = app;
