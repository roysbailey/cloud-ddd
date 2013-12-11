// Wire up express to handle http requests
var express = require('express');
var app = express();

// Direct request for static types to the /public folder
// Note: localhost/scripts/_references.js would mao to /public/scripts/_references.js in the project
app.use(express.static(__dirname + '/public'));

// Start listenting on a port
app.listen(1337);