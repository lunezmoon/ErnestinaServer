var express = require('express');
var router = express.Router();

//Cloudant
var cloudant_cred = require('../credentials/cloudant_credentials.json');
var Cloudant = require('@cloudant/cloudant');
var cloudant = Cloudant(cloudant_cred.url);
var db = cloudant.db.use("ernestinadb");

//Object Storage
var object_storage_cred = require('../credentials/object_storage_credentials.json');
var objectStorageSDK = require('ibm-cos-sdk');
var objectStorage = new objectStorageSDK.S3(object_storage_cred);
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var fs = require('fs');

//PosgreSQL
var posgre_cred = require('../credentials/posgre_credentials.json');
const { Client } = require('pg')
var client = new Client(posgre_cred)

var currentDirectory = process.cwd()

/* GET users listing. */
router.post('/addUserInfo', upload.single('file'), function(req, res, next) {

  fs.readFile(currentDirectory + '/uploads/' + req.file.filename, function (err, data) {
    if (err) { 
      console.log("Failed to read file from upload folder");
      console.log(err);
    } else {
      var params = {'ACL': 'public-read', 'Bucket': 'ernestina', 'Key': req.file.filename + '.jpg', 'Body': data};

      objectStorage.upload(params, function(err, data) {
        if (err) {
          console.log("Failed to upload profile picture to Object Storage");
          console.log(err);
        } else {
          console.log("Succeeded to upload profile picture to Object Storage");
          console.log(data);

          var profileImgKey = data["key"];
          var profileImgLocation = data["Location"];

          fs.exists(currentDirectory + '/uploads/' + req.file.filename, function(exists) {
            if(exists) {
              fs.unlink(currentDirectory + '/uploads/' + req.file.filename, (err) => {
                if (err) throw err;
                console.log("Deleted temporary upload file");
              });
            } else {
            }
          });
          
          var userId = req.body['userId'];
          var password = req.body['password'];
          var surname = req.body['surname'];
          var firstName = req.body['firstName'];
          var surnameRead = req.body['surnameRead'];
          var firstNameRead = req.body['firstNameRead'];
          var role = req.body['role'];
          var expertise = req.body['expertise'];
          var introduction = req.body['introduction'];

          client.connect()
          const sql = "INSERT INTO user_info (user_id, password, surname, first_name, surname_read, first_name_read, role, expertise, introduction, profile_image_key, profile_image_location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)";
          const values = [userId, password, surname, firstName, surnameRead, firstNameRead, role, expertise, introduction, profileImgKey, profileImgLocation];
          client.query(sql, values)
            .then(response => {
                console.log("Insert SQL execution succeeded")
                console.log(response)
                res.send(response)
            })
            .catch(e => console.error(e.stack))
        }
      });
    }
  });
  /* Cloudant
  console.log("before insert")
  db.insert({ _id: userID , password: password, category: "USERINFO",profile_picture_file_name: req.file.filename}, function(err,data) {
    if (err) {
      console.log(err)
    } else {
      console.log("Insert Success")
    }
  });
  console.log("after insert")
  */
});

  router.post('/addTestResults', function(req, res, next) {
    
    var testId = req.body['testId'];
    var userId = req.body['userId'];
    var lectureTitle = req.body['lectureTitle'];
    var passage = req.body['passage'];
    var option1 = req.body['option1'];
    var option2 = req.body['option2'];
    var option3 = req.body['option3'];
    var option4 = req.body['option4'];
    var correctAns = req.body['correctAns'];
    var selectedAns = req.body['selectedAns'];
    var score = req.body['score'];
    var totalScore = req.body['totalScore'];
    var rating = req.body['rating'];
    var timestamp = req.body['timestamp'];
    
    console.log("passed params");

    client.connect()
    const sql = "INSERT INTO test_results_history (test_id, user_id, lecture_title, passage, option_1, option_2, option_3, option_4, correct_ans, selected_ans, score, total_score, rating, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)";
    const values = [testId, userId, lectureTitle, passage, option1, option2, option3, option4, correctAns, selectedAns, score, totalScore, rating, timestamp];
    client.query(sql, values)
      .then(response => {
          console.log("Insert SQL execution succeeded")
          console.log(response)
          res.send(response)
      })
      .catch(e => console.error(e.stack))
  });

router.post('/getUserInfo', function(req, res, next) {
  
  var userId = req.body['userId'];

  client.connect()
  const sql = "SELECT * FROM user_info WHERE user_id = $1"
  const values = [userId]
  client.query(sql, values)
    .then(response => {
        console.log("Select SQL execution succeeded")
        console.log(response)
        res.send(response.rows)
    })
    .catch(e => console.error(e.stack));

  /* Cloudant
  db.get(userID, function(err,dbData) {
    console.log(dbData);
    var params = {'Bucket': 'ernestina', 'Key': dbData['profile_picture_file_name'] + ".jpg"}
  
    objectStorage.getObject(params, function(err, osData) {
      if (err) {
        console.log("Retreive Fail");
        console.log(err);
      } else {
        console.log("Retrieve success");
        console.log(osData);
        res.send({'userid': dbData['userid'], 'password': dbData['password'], 'profilepicture': osData});
      }
    });
  });
  */
});

router.post('/getAllUserInfo', function(req, res, next) {
  
  client.connect()
  const sql = "SELECT * FROM user_info"
  client.query(sql, (err, response) => {
    if (err) {
      console.log(err)
    }
    else {
      /*
      for (row of response.rows){

        var params = {'Bucket': 'ernestina', 'Key': row["profile_image_key"]};
        objectStorage.getObject(params, function(err, osData) {
          if (err) {
            console.log("Retreive Fail");
            console.log(err);
          } else {
            console.log("Retrieve success");  
            var userInfo = {"userId": row["user_id"], "profileImg": osData.Body};
            console.log(userInfo);
            userInfoArray.push(userInfo);
          }
        });
      }
      */
      console.log("Select SQL execution succeeded")
      res.send(response.rows);
    }
  })
});

router.post('/getTestResultsHistoryUniqueId', function(req, res, next) {

  client.connect()
  const sql = "select nextval('test_results_history_seq')"
  client.query(sql, (err, response) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log("Select SQL execution succeeded")
      res.send(response.rows);
    }
  })
});

router.post('/getAllTestResultsHistory', function(req, res, next) {
  
  var userId = req.body['userId'];

  client.connect()
  const sql = "SELECT DISTINCT test_id, lecture_title, timestamp FROM test_results_history WHERE user_id = $1"
  const values = [userId]
  client.query(sql, values)
    .then(response => {
        console.log("Select SQL execution succeeded")
        console.log(response)
        res.send(response.rows)
    })
    .catch(e => console.error(e.stack));
  });

router.post('/getTestResultsHistory', function(req, res, next) {

  var testId = req.body['testId'];

  client.connect()
  const sql = "SELECT * FROM test_results_history WHERE test_id = $1"
  const values = [testId]
  client.query(sql, values)
    .then(response => {
        console.log("Select SQL execution succeeded")
        console.log(response)
        res.send(response.rows)
    })
    .catch(e => console.error(e.stack));
  });

router.post('/addDocument', function(req, res, next) {

  var userId = req.body['userId'];
  var documentId = req.body['documentId'];
  var documentName = req.body['documentName'];
  var timestamp = req.body['timestamp'];
  
  console.log("passed params");

  client.connect()
  const sql = "INSERT INTO user_documents (user_id, document_id, document_name, timestamp) VALUES ($1, $2, $3, $4)";
  const values = [userId, documentId, documentName, timestamp];
  client.query(sql, values)
    .then(response => {
        console.log("Insert SQL execution succeeded")
        console.log(response)
        res.send(response)
    })
    .catch(e => console.error(e.stack))
});

router.post('/getAllDocuments', function(req, res, next) {
  
  var userId = req.body['userId'];

  client.connect()
  const sql = "SELECT * FROM user_documents WHERE user_id = $1"
  const values = [userId]
  client.query(sql, values)
    .then(response => {
        console.log("Select SQL execution succeeded")
        console.log(response)
        res.send(response.rows)
    })
    .catch(e => console.error(e.stack));
});

router.post('/deleteDocument', function(req, res, next) {
  
  var userId = req.body['userId'];
  var documentId = req.body['documentId'];

  client.connect()
  const sql = "DELETE FROM user_documents WHERE user_id = $1 AND document_id = $2"
  const values = [userId, documentId]
  client.query(sql, values)
    .then(response => {
        console.log("Delete SQL execution succeeded")
        console.log(response)
        res.send(response.rows)
    })
    .catch(e => console.error(e.stack));
});

router.post('/getProperty', function(req, res, next) {
  
var propertyName = req.body['propertyName']

  client.connect()
  const sql = "SELECT * FROM properties WHERE property_name = $1"
  const values = [propertyName]
  client.query(sql, values)
    .then(response => {
        console.log("Delete SQL execution succeeded")
        console.log(response)
        res.send(response.rows)
    })
    .catch(e => console.error(e.stack));
});

module.exports = router;