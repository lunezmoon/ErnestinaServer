var express = require('express');
var router = express.Router();

var cred = require('../credentials/watson_credentials.json');
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var assistant = new AssistantV1(cred.assistant.credentials);
var context = {};

router.post('/message', function(req, res, next) {
    
  var params = {'workspace_id': cred.assistant.workspace_id, 
              'context': context, 'input': {'text': req.body['input']}};
  
  assistant.message(params, function(err, response) {
    if (err)
      console.log("Failed to retrieve response from watson assistant", err);
    else
      console.log("Succeed in retrieving response from watson assistant");
      console.log(JSON.stringify(response, null, 2));
      context = response.context;
      res.send(JSON.stringify(response, null, 2));
  });
});

module.exports = router;