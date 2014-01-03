// Get the items we need to wire up MongoDB
var mongo = require('mongodb');
var monk = require('monk');
var api = require('./api/providercontext.js');
var epub = require('./services/eventpublication.js')

// Wire up express to handle http requests
var express = require('express');
var app = express();
app.configure(function() {
    app.use(express.bodyParser());

    // Direct request for static types to the /public folder
    // Note: localhost/scripts/_references.js would mao to /public/scripts/_references.js in the project
    app.use(express.static(__dirname + '/public'));
});

//var mongoUrl = process.env.IP + ':27017/OrgDir';
var mongoUrl = 'localhost:27017/OrgDir';
var db =  monk(mongoUrl);


// app.get('/test', function(req,res){
//   db.driver.collectionNames(function(e,names){
//     res.json(names);
//   });
// });

// app.get('/collections/:name', function(req,res) {
//   var collection = db.get(req.params.name);
//   collection.find({},{limit:20}, function(e,docs) {
//     res.json(docs);
//   });
// });

// app.post('/test', function(req, res) {
//   var tmp = req.body;  
// });

//#region REST interface
app.post('/api/refreshdb', api.refreshdb(db));
app.get('/api/providers/:ukprn', api.getProvider(db));
app.put('/api/providers/:ukprn', api.updateProvider(db));
app.del('/api/providers/:ukprn', api.deleteProvider(db));
app.get('/api/providers', api.getProviders(db));

app.post('/notification/providers/init', epub.initialiseEventSourcing(db));
//#endregion REST interface

// Start listenting on a port
//app.listen(process.env.PORT);

app.listen(1337);
