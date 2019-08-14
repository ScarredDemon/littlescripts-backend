const express = require("express");
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');
aws.config.region = 'eu-west-2';
const S3_BUCKET = process.env.S3_BUCKET;

// const mariadb = require('mariadb');
// const pool = mariadb.createPool({
//   host: 'localhost',
//   port: 3306,
//   user: 'ukovsxww',
//   database: 'ukovsxww_littleScripts',
//   password: 'YtFej28#Oq*Y31'
// });

const mongodbURL = 'mongodb+srv://littleScripts:VIcbwXJS3IZhG5XR@cluster0-gwe0u.azure.mongodb.net/test?retryWrites=true&w=majority';

mongoose
  .connect(mongodbURL, {useNewUrlParser: true})
    .then(res => {
      console.log(' mongodb res', res)
    })
    .catch(err => {
      console.log('mongodb err', err);
    });

const Images = require("../models/img");

let fileRename = '';

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log(file);
    const isValid = MIME_TYPE_MAP[file.mimetype];
    console.log(file.mimetype);
    let error = new Error('Invalid Mime-Type');
    if(isValid){
      error = null;
    }
    cb(error, 'images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    const newFileName = name + '-' + Date.now() + '.' + ext;
    console.log(newFileName);
    fileRename = newFileName;
    cb(null, newFileName);
  }
});

const uploadImg = multer({ 
  storage: storage,
}).single('file');

// router.get('/test', (req, res, next) => {
//   const img = new Images({
//     _userID: '84e950e4-67af-49af-a5e8-9073b71a987c',
//     title: 'fileRename',
//     path: 'backend/images',
//     originalName: 'req.file.originalname'
//   });
//   img.save()
//     .then(resp => {
//       console.log(res);
//       res.status(200).json({test: 'it works!!'})
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(410).json({test: 'failed..'})
//     });
// });

router.post("/post", (req, res, next) => {
  console.log('image upload');

  const s3 = new aws.S3();
  const fileName = fileRename;
  const fileType = req.params.file.mimetype;
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileRename,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      res.status(415).json({ message: 'Something went wrong signing the file' });
    };
    uploadImage(data)
  });

  function uploadImage(signedRequest) {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedRequest);
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          const img = new Images({
            _userID: req.body._userID,
            title: fileRename,
            path: `https://${S3_BUCKET}.s3.amazonaws.com/${fileRename}`,
            originalName: req.file.originalname
          });
          // res.status(200).json({ message: "Image Upload Almost Working!!!" });
          img.save().then(savedImg => {
            res.status(200).json({ message: 'Image upload Success: ', fileName: fileRename });
          });
        }
        else{
          res.status(415).json({ message: 'Something Went Wrong uploading the file' });
        }
      }
    };
    xhr.send(file);

  }

    // if (err) {
    //   res.status(415).json({ message: 'Unsupported Image type' });
    // } else {
    //   const img = new Images({
    //     _userID: req.body._userID,
    //     title: fileRename,
    //     path: 'images',
    //     originalName: req.file.originalname
    //   });
    //   // res.status(200).json({ message: "Image Upload Almost Working!!!" });
    //   img.save().then(savedImg => {
    //     res.status(200).json({ message: 'Image upload Success: ', fileName: fileRename });
    //   });
    // }
});

router.get("/get/:_userID", (req, res, next) => {
  // console.log(req.params);
  let updatedImg = [];
  console.log(req.params._userID)
  Images.find({ _userID: req.params._userID}).then(images => {
    images.forEach(element => {
      let data = element.path+'/'+element.title;
      let buff = fs.readFileSync(data);
      let base64Img = buff.toString('base64');
      updatedImg.push({
        _userID: element._userID,
        originalName: element.originalName,
        title: element.title,
        imgString: base64Img
      });
    });
    res.status(200).json({
      message: "Images fetched successfully!",
      images: updatedImg
    });
  });

  // pool.getConnection()
  //   .then(conn => {
  //     conn.query(`
  //       SELECT * 
  //       FROM images
  //       WHERE _userID = '${req.params._userID}'
  //       `)
  //       .then(rows => {
  //         if (rows == []) {
  //           res.status(400).json({status: 'error', res: 'No data to return'});
  //           conn.end();
  //         } else {
  //           res.status(200).json({status: 'success', res: rows});
  //           conn.end();
  //         }
  //         console.log('rows', rows);
  //       })
  //       .catch(err => {
  //         res.status(400).json({status: 'error', res: err});
  //         conn.end();
  //         console.log(err);
  //       });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
});

router.get("/download/:imgTitle", (req, res, next) => {
  let imgDir = path.join(__dirname, '../images');
  let fileName;
  let imgUrl;
  Images.find({ title: req.params.imgTitle})
  .then(image => {
    fileName = image[0].title;
    imgUrl = image[0].path;
    res.sendFile(imgUrl, (err) => {
      if(err) {
        res.status(400).json({
          message: 'An unknow error occured'
        });
        return;
      }
      res.status(400).json({
        message: 'File successfully sent',
        fileName: fileName
      });
    })
  });
});

module.exports = router;
