// Get the items we need to wire up MongoDB
var mongo = require('mongodb');
var monk = require('monk');
//var api = require('./api/providercontext.js');

// Wire up express to handle http requests
var express = require('express');
var app = express();
app.configure(function() {
    app.use(express.bodyParser());

    // Direct request for static types to the /public folder
    // Note: localhost/scripts/_references.js would mao to /public/scripts/_references.js in the project
    app.use(express.static(__dirname + '/public'));
});

var mongoUrl = process.env.IP + ':27017/OrgDir';
var db =  monk(mongoUrl);

//app.get('/test', function(req, res) {
//  res.send('Thanks for calling test!');  
//});


//#region REST interface

app.get('/test', function(req,res){
  db.driver.collectionNames(function(e,names){
    res.json(names);
  });
});

app.get('/collections/:name', function(req,res) {
  var collection = db.get(req.params.name);
  collection.find({},{limit:20}, function(e,docs) {
    res.json(docs);
  });
});

app.post('/test', function(req, res) {
  var tmp = req.body;  
});

//app.post('/refreshdb', api.refreshdb(db));

app.post('/api/refreshdb', function(req, res) {
    // Get the list of providers from the body.
    var newProviderList = req.body;

    // Set our collection
    var collection = db.get('providers');
    collection.remove();

    // Submit to the DB
    collection.insert(
        newProviderList,
        function (err, doc) {
        if (err) {
            var error = {
                msg: "Failed to update providers",
                error: err
                };
            res.json(error);
        } else {
            var success = {
                msg: "Providers update ok"
                };
            res.json(success);
        }
    });
});

//#endregion REST interface


// Start listenting on a port
app.listen(process.env.PORT);
