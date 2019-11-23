var express = require('express');
var router = express.Router();

var cred = require('../credentials/watson_credentials.json');
var NaturalLanguageClassifierV1 = require('watson-developer-cloud/natural-language-classifier/v1');
natural_language_classifier = new NaturalLanguageClassifierV1(cred.natural_language_classifier);

router.post('/classify', function(req, res, next) {
    
    natural_language_classifier.classify({'text': req.body["text"],'classifier_id': "0ee0f3x478-nlc-1722"},function(err, res) {
        if (err)
            console.log(err);
        else
            console.log(res);
    });
});

module.exports = router;