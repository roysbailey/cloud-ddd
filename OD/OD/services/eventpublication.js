/**
 * Created by rbailey on 03/01/14.
 */

var AWS = require('aws-sdk');
var esConfig = require('./esconfig');
var httpStatus = require('http-status');

exports.initialiseEventSourcing = function(db) {
    return function(req, res) {
        var s3;
        s3 = new AWS.S3({params: {Bucket: 'EventSourcing'}});
        s3.createBucket(function(err, data) {
            if (!err) {
                var strConfig = JSON.stringify(esConfig.esConfig);
                s3.putObject({Key: 'esConfig', Body: strConfig}, function() {
                    console.log("Successfully initialised AWS event source");
                    res.send(httpStatus.CREATED);
                    res.setHeader('Location', '/notification/providers');
                });
            } else {
                res.send(httpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    };
};

exports.publishEvent = function(mode, object) {
    var s3;
    s3 = new AWS.S3();

    var options = {
        Bucket: 'EventSourcing',
        Key: 'esConfig',
        ResponseContentType: 'application/json'
    };

    s3.getObject(options, function(err, data) {
        var currentEventFeed;
        if (!err) {
            var jsonBody = data.Body.toString();
            var conf = JSON.parse(jsonBody);
            currentEventFeed = conf.currentEventFeed;
            console.log("Current event feed:" + currentEventFeed);
        }
    });

};

