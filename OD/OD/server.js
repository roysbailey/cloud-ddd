// Get the items we need to wire up MongoDB and our API
var mongo = require('mongodb');
var monk = require('monk');
var api = require('./api/providercontext');
var provEvents = require('./notifications/providerEvents')

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

//#region REST interface for provider manipulation
app.post('/api/refreshdb', api.refreshdb(db));
app.get('/api/providers/:ukprn', api.getProvider(db));
app.put('/api/providers/:ukprn', api.updateProvider(db));
app.del('/api/providers/:ukprn', api.deleteProvider(db));
app.get('/api/providers', api.getProviders(db));
//#endregion REST interface for provider manipulation

//#region REST interface for provider event sourcing
app.post('/providers/notifications/init', provEvents.initialiseEventSourcing);
app.get('/providers/notifications', provEvents.getRecentNotificationFeed);
app.get('/providers/notifications/:feedID', provEvents.getNotificationFeed);
//#endregion REST interface for provider event sourcing

// Start listening on a port
app.listen(1337);
//app.listen(process.env.PORT);
