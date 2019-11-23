var express = require('express');
var multer = require('multer')
var upload = multer({dest: 'uploads/'});
var router = express.Router();
var fs = require('fs');

var cred = require('../credentials/object_storage_credentials.json');

var objectStorageSDK = require('ibm-cos-sdk');
var objectStorage = new objectStorageSDK.S3(cred);

var currentDirectory = process.cwd();

/* GET users listing. */
router.post('/addObject', upload.single('file'), function(req, res, next) {
  
  console.log(req.body);
  fs.readFile(currentDirectory + '/uploads/' + req.file.filename, function (err, data) {
    if (err) { 
      console.log(err);
    } else {
      var params = {'Bucket': 'ernestina', 'Key': 'profile.jpg', 'Body': data};
   
      objectStorage.upload(params, function(err, data) {
        if (err) {
          console.log("upload fail");
          console.log(err);
        } else {
          console.log("upload success");
        }
      });
    }
  });
  res.send('select');
});

router.post('/getImage', function(req, res, next) {

  var params = {'Bucket': 'ernestina', 'Key': 'test.jpg'}

  objectStorage.getObject(params, function(err, data) {
    if (err) {
      console.log("Retreive Fail");
      console.log(err);
    } else {
      console.log("Retrieve success");
      console.log(data);
      res.send(data);
    }
  });
});

module.exports = router;
