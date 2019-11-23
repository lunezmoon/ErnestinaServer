var express = require('express');
var router = express.Router();

var cred = require('../credentials/google_credentials.json');
var google = require('googleapis');
var customSearch = google.google.customsearch('v1');

router.post('/customImageSearch', function(req, res, next) {
  
  var searchEngineID = cred.search_engine_id;
  var apiKey = cred.apikey;
  var search = req.body['search'];

  customSearch.cse.list({ cx: searchEngineID, q: search, auth: apiKey, searchType: 'image' }, function(err, resp) {
    if (err) {
      console.log("Error occured while retrieving google search results", err);
      return;
    };
    // Got the response from custom search
    if (resp.items && resp.items.length > 0) {
      console.log("Succeeded in retrieveing google search results")
      console.log(resp);
      res.send(resp);
    };
  });
});

router.post('/customSearch', function(req, res, next) {
  
  var searchEngineID = cred.search_engine_id;
  var apiKey = cred.apikey;
  var search = req.body['search'];

  customSearch.cse.list({ cx: searchEngineID, q: search, auth: apiKey }, function(err, resp) {
    if (err) {
      console.log("Error occured while retrieving google search results", err);
      return;
    };
    console.log(resp.data.items);
    // Got the response from custom search
    res.send(resp.data.items);
  });
});

module.exports = router;
