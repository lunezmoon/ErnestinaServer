var express = require('express');
var router = express.Router();

var cred = require('../credentials/watson_credentials.json');
var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
var discovery = new DiscoveryV1(cred.discovery.credentials);
var environmentId = cred.discovery.queryinfo.environmentid;
var collectionId = cred.discovery.queryinfo.collectionid;
var multer = require('multer')
var upload = multer({dest: 'uploads/'});
var fs = require('fs');

var currentDirectory = process.cwd()

router.post('/query', function(req, res, next) {

  var query = req.body['query'];
  var documentId = req.body['documentId'];

  var params = {
    'query': query,
    'environment_id': environmentId,
    'collection_id': collectionId,
    'passages': true,
    'filter': "id::" + documentId
  }
  
  discovery.query(params, (error, results) => {
    if (error) {
      console.log("Failed in retrieving query results from watson discovery");
      console.log(error);
      next(error);
    } else {
      console.log("Succeeded in retrieving query results from watson discovery");
      console.log(results);
      res.send(results["results"]);
    }
  });
});

router.post('/naturalLanguageQuery', function(req, res, next) {

  var naturalLanguageQuery = req.body['natural_language_query'];
  var documentId = req.body['documentId'];

  var params = {
    'natural_language_query': naturalLanguageQuery,
    'environment_id': environmentId,
    'collection_id': collectionId,
    'passages': true,
    'filter': "id::" + documentId
  }
  
  discovery.query(params, (error, results) => {
    if (error) {
      console.log("Failed in retrieving natural language query results from watson discovery");
      console.log(error);
      next(error);
    } else {
      console.log("Succeeded in retrieving natural language query results from watson discovery");
      console.log(results);
      res.send(results);
    }
  });
});

router.post('/getAllDocumentInfo', function(req, res, next) {

  var params = {
    'query': "",
    'environment_id': environmentId,
    'collection_id': collectionId,
    'passages': true
  }
  
  discovery.query(params, (error, results) => {
    if (error) {
      console.log("Failed in retrieving document information from watson discovery");
      next(error);
    } else {
      console.log("Succeeded in retrieving document information from watson discovery");
      
      var documentInfoArray = []

      for (result of results['results']) {
        var documentInfo = {"filename": result['extracted_metadata']['filename'], "id": result['id']}
        documentInfoArray.push(documentInfo);
      }
      console.log(documentInfoArray);
      console.log(results['results']);
      res.send(documentInfoArray);
    }
  });
});

router.post('/addDocument', upload.single('file'), function(req, res, next) {
  
  var fileName = req.body['fileName'];

  fs.readFile(currentDirectory + '/uploads/' + req.file.filename, function (err, data) {
    if (err) { 
      console.log("Failed to read temporary upload document");
      console.log(err);
    } else {
      console.log("Succeeded in reading temporary upload document");
      console.log(data);

      var params = {
        'environment_id': environmentId,
        'collection_id': collectionId,
        'file': {'value': data, 'options': {'filename': fileName}},
        'file_content_type': "application/pdf",
      }

      discovery.addDocument(params, function(error, data) {
        if (error) {
          console.log("Failed in adding document to watson discovery");
          console.log(error)
        } else {
          console.log("Succeeded in adding document to watson discovery");
          console.log(JSON.stringify(data, null, 2));

          fs.exists(currentDirectory + '/uploads/' + req.file.filename, function(exists) {
            if(exists) {
              fs.unlink(currentDirectory + '/uploads/' + req.file.filename, (err) => {
                if (err) throw err;
                console.log("Deleted temporary upload file");
              });
            } else {
            }
          });

          res.send(JSON.stringify(data, null, 2));
        }
      });
    }
  });
});

router.post('/updateDocument', upload.single('file'), function(req, res, next) {
  
  var documentId = req.body['documentId'];
  var fileName = req.body['fileName'];

  fs.readFile('/Users/hirokiharigai/Desktop/ErnestinaServer/uploads/' + req.file.filename, function (err, data) {
    if (err) { 
      console.log("Failed to read temporary upload document");
      console.log(err);
    } else {
      console.log("Succeeded in reading temporary upload document");
      
      var params = {
        'environment_id': environmentId,
        'collection_id': collectionId,
        'document_id': documentId,
        'file': {'value': data, 'options': {'filename': fileName}}
      }
    
      discovery.updateDocument(params, function(error, data) {
        if (error) {
          console.log("Failed in updating document to watson discovery");
          console.log(error)
        } else {
          console.log("Succeeded in updating document to watson discovery");
          console.log(JSON.stringify(data, null, 2));

          fs.exists(currentDirectory + '/uploads/' + req.file.filename, function(exists) {
            if(exists) {
              fs.unlink(currentDirectory + '/uploads/' + req.file.filename, (err) => {
                if (err) throw err;
                console.log("Deleted temporary upload file");
              });
            } else {
            }
          });
          res.send(JSON.stringify(data, null, 2));
        }
      });
    }
  });
});

router.post('/deleteDocument', function(req, res, next) {
  
  var documentId = req.body['documentId'];

  var params = {
    'environment_id': environmentId,
    'collection_id': collectionId,
    'document_id': documentId
  }

  discovery.deleteDocument(params, function(error, data) {
    if (error) {
      console.log("Failed in deleting document to watson discovery");
      console.log(error)
    } else {
      console.log("Succeeded in deleting document to watson discovery");
      console.log(JSON.stringify(data, null, 2));
      res.send(JSON.stringify(data, null, 2));
    }
  });
});

module.exports = router;
