var express = require('express');
var router = express.Router();

var cred = require('../credentials/watson_credentials.json');
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1');
natural_language_understanding = new NaturalLanguageUnderstandingV1(cred.natural_language_understanding);

router.post('/analyze', function(req, res, next) {
    
    console.log("analyze called");
    var text = req.body["text"];

    var parameters = {
        'text': text,
        'features': {
            'keywords': {},
            'concepts': {},
            'entities': {},
        }
    };

    natural_language_understanding.analyze(parameters, function(err, response) {
        if (err)
          console.log('error:', err);
        else
          console.log(JSON.stringify(response, null, 2));
          res.send(JSON.stringify(response, null, 2));
    });
});

module.exports = router;