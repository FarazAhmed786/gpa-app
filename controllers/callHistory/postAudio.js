
//***** Modules goes here *****//
const express = require('express');
const { MessageData } = require('../../Models/mesage.model');
const upload = require("../../constants/multer");
const cloudinary = require("../../constants/cloudinary");
const fs = require("fs");


const app = express();

app.post('/',
    upload.fields([{ name: "audio" }]),
    async (req, res) => {
        const file = req.files.audio;
        if (file == null) {
            var errors = {
                success: false,
                msg: 'Audio is required'
            };
            res.status(403).send(errors);
            return;
        }

        await saveMsg(req)
            .then(result => {
                res.send(result);
                return;
            })
            .catch(ex => {
                res.send(ex);
                return;
            })
    });

async function saveMsg(req) {
    return new Promise(async (resolve) => {
        const audio = async (path) => await cloudinary.uploads(path, "voice-note");
        const aud = req.files.audio[0];
        const { path } = aud;
        const audURL = await audio(path);
        fs.unlinkSync(path);
        req.body.audio = audURL.url;

        const newMessage = new MessageData(req.body);
        const result = await newMessage.save();
        resolve(result);
    })
}


module.exports = app;
