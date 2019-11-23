var express = require('express');
var router = express.Router();

const fetch = require('isomorphic-fetch')
const SparqlHttp = require('sparql-http-client')

router.post('/getInformation', function(req, response, next) {
    
    var label = req.body['label'];

    console.log("getInformation called");

    SparqlHttp.fetch = fetch

    // which endpoint to query
    const endpoint = new SparqlHttp({endpointUrl: 'http://ja.dbpedia.org/sparql'})
    const query = 
    `PREFIX dbpj: <http://ja.dbpedia.org/resource/>
    PREFIX dbp-owl: <http://dbpedia.org/ontology/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?comment ?label ?thumbnail
    WHERE
    {
     dbpj:${label} rdfs:comment ?comment.
     dbpj:${label} rdfs:label ?label.
     OPTIONAL { dbpj:${label} dbp-owl:thumbnail ?thumbnail. }
    }`

    // Promise形式でデータを取得
    endpoint.selectQuery(query)
    .then(res => res.text())
    .then(body => {
        const result = JSON.parse(body);
        response.send(result);
        console.log(JSON.stringify(result, null, ' '));
    }).catch(err => console.error(err))

    });

module.exports = router;