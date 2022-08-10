//***** Modules goes here *****//
const express = require('express');
const Joi = require('joi');
const { HelpData } = require('../../Models/help.model');
const cloudinary = require('cloudinary')
const multer = require("multer");
require('dotenv').config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

    const uploadDb = (file, folder) => {
        return new Promise(resolve => {
            cloudinary.uploader.upload(file, (result) => {
            resolve({
                url: result.url,
                id: result.public_id
            })
            }, {
            resource_type: "auto",
            folder: folder
            })
        })
        }

    const fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'public/images'); // for folder name
        },
        filename: (req, file, cb) => {
          cb(
            null,
            `${new Date().toISOString().replace(/:/g, "-")}-${file.originalname}`
          );
        }
      });

      const fileFilter = (req, file, cb) => {
        if (
          file.mimetype === "image/png" ||
          file.mimetype === "image/jpg" ||
          file.mimetype === "image/jpeg"
        ) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      };

      var uploadIMG = multer({ storage: fileStorage, fileFilter: fileFilter })

const app = express();
//***** ///// *****//


//***** Post Request for Help*****//
app.post('/',uploadIMG.single('image'), (req, res) => {
console.log("req", req)

    const { error } = validateApiData(req);

    if (error) {
        var errors = {
            success: false,
            msg: error.name,
            data: error.details[0].message
        };
        res.status(403).send(errors);
        return;
    }

    addData(req.body, req.file).then(data => {
            res.send(data)
            return;
    }).catch(errors => {
       res.status(403).send(errors);
       return;
    })


});


async function addData(data, file) {
    const imageUrl = await uploadDb(file.path, 'image')
    data.image = imageUrl.url
    let helpData = new HelpData(data)
    let res;

    try {
        res = await helpData.save()
    } catch (error) {
        res = error
    }
    return res
}

//***** ///// *****//

function validateApiData(req) {
    const data = {...req.body, image: req.file}
    const schema = Joi.object().keys({
        title: Joi.string().required(),
        subTitle: Joi.string().required(),
        image: Joi.any().meta({swaggerType: 'file'}).required()
    });
    return Joi.validate(data, schema)
}
//***** ///// *****//

module.exports = app;