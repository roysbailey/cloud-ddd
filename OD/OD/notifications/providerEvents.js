/**
 * Created by rbailey on 06/01/14.
 */

var AWS = require('aws-sdk');
var esConfigConstants = require('../services/esconfig').esConfigConstatnts;
var httpStatus = require('http-status');
var esConfig = require('../services/esconfig').esConfig;
var cacheConfig = require('../services/cacheConfig').cacheConfig;

exports.initialiseEventSourcing = function(req, res) {
    var s3 = new AWS.S3({params: {Bucket: esConfigConstants.EVENT_BUCKET_NAME}});
    s3.createBucket(function(err, data) {
        if (!err) {
            var strConfig = JSON.stringify(esConfig);
            s3.putObject({Key: esConfigConstants.EVENT_CONFIG_KEY_NAME, Body: strConfig}, function(err, data) {
                if (!err) {
                    console.log("[ES].[initialiseEventSourcing] - Successfully initialised AWS event source: " + esConfigConstants.EVENT_CONFIG_KEY_NAME + ' in bucket: ' + esConfigConstants.EVENT_BUCKET_NAME);
                    res.setHeader('Location', '/providers/notifications');
                    res.send(httpStatus.CREATED);
                } else {
                    console.log("[ES].[initialiseEventSourcing] - Failed to initialise AWS event source " + esConfigConstants.EVENT_CONFIG_KEY_NAME + ' in bucket: ' + esConfigConstants.EVENT_BUCKET_NAME + ' Error: ' + err);
                    res.status(httpStatus.INTERNAL_SERVER_ERROR)
                        .send("Failed to initialise event sourcing" + err);
                }
            });
        } else {
            console.log("[ES].[initialiseEventSourcing] - Failed to initialise AWS event source " + esConfigConstants.EVENT_CONFIG_KEY_NAME + ' in bucket: ' + esConfigConstants.EVENT_BUCKET_NAME + ' Error: ' + err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .send("Failed to initialise event sourcing" + err);
        }
    });
};

exports.getRecentNotificationFeed = function(req, res) {
    var s3;
    s3 = new AWS.S3();

    s3.getObject(
        {Bucket: esConfigConstants.EVENT_BUCKET_NAME,
            Key: esConfigConstants.EVENT_CONFIG_KEY_NAME,
            ResponseContentType: esConfigConstants.RESPONSE_CONTENT_TYPE},
        function(err, data) {
        var currentEventFeed;
        if (!err) {
            var jsonBody = data.Body.toString();
            var conf = JSON.parse(jsonBody);
            currentEventFeed = conf.currentEventFeed;
            console.log("[ES].[getRecentNotificationFeed] - Current feed ID from config : " + currentEventFeed);

            // Load the "current feed"
            var eventFeedKey = esConfigConstants.EVENT_FEED_KEY_NAME_PREFIX + currentEventFeed;
            s3.getObject(
                {Bucket: esConfigConstants.EVENT_BUCKET_NAME,
                    Key: eventFeedKey,
                    ResponseContentType: esConfigConstants.RESPONSE_CONTENT_TYPE},
                function(err, data) {
                var eventFeedObj;
                if (!err) {
                    console.log("[ES].[getRecentNotificationFeed] - Loaded current feed ID : " + currentEventFeed);
                    var eventFeedJsonBody = data.Body.toString();
                    eventFeedObj = JSON.parse(eventFeedJsonBody);

                    var feedETag = makeETag(eventFeedObj);
                    console.log("[ES].[getRecentNotificationFeed] - ETags - current feed: [" + feedETag + '] from request header: [' + req.headers['if-none-match'] + ']');

                    if (req.headers['if-none-match'] === feedETag){
                        console.log("[ES].[getRecentNotificationFeed] - Feed not modified, sending 304 NOT_MODIFIED to client (with no http response body)");
                        res.send(httpStatus.NOT_MODIFIED);
                    } else {
                        // Now, we need to modify the relationship exposed to reflect this is the "recent" feeds they are looking at.
                        // See "REST in Practice" page: 194 / 212
                        eventFeedObj._links.via = {href: eventFeedObj._links.self.href};
                        eventFeedObj._links.self.href = '/providers/notifications';

                        // Send the new feed with a cache and an ETag.
                        console.log("[ES].[getRecentNotificationFeed] - Feed IS modified, sending new feed to client with ETag: " + feedETag + " and Cache-Control: " + cacheConfig.recentFeed_CacheControl);
                        res.setHeader('Cache-Control', cacheConfig.recentFeed_CacheControl);
                        res.setHeader('ETag', feedETag);
                        res.json(eventFeedObj);
                    }
                }
            });
        }
        function makeETag(feed) {
            return feed.updated;
        }
    });
}

exports.getNotificationFeed = function(req, res) {
    var feedID = parseInt(req.params.feedID, 10);
    var eventFeedKey = esConfigConstants.EVENT_FEED_KEY_NAME_PREFIX + feedID;
    console.log("[ES].[getNotificationFeed] - The following feed is requested : " + feedID);
    var s3 = new AWS.S3();
    s3.getObject(
        {Bucket: esConfigConstants.EVENT_BUCKET_NAME,
            Key: eventFeedKey,
            ResponseContentType: esConfigConstants.RESPONSE_CONTENT_TYPE},
        function(err, data) {
            if (!err) {
                console.log('[ES].[getNotificationFeed] - Loaded the feed: ' + eventFeedKey);
                var eventFeedJsonBody = data.Body.toString();
                var eventFeedObj = JSON.parse(eventFeedJsonBody);
                res.setHeader('Cache-Control', cacheConfig.archiveFeed_CacheControl);
                console.log("[ES].[getNotificationFeed] - Sending new feed to client with Cache-Control: " + cacheConfig.archiveFeed_CacheControl);
//                res.setHeader('Expires', 'Tue, 07 Jan 2014 20:00:00 GMT');
                res.json(eventFeedObj);
            } else if (err.code === esConfigConstants.ERROR_NO_SUCH_KEY) {
                console.log('[ES].[getNotificationFeed] - Could not find the feed with the following ID (sending 404 NOT_FOUND to client): ' + eventFeedKey);
                res.status(httpStatus.NOT_FOUND)
                    .send('Could not find an event source feed with the ID: ' + feedID);
            } else {
                console.log('[ES].[getNotificationFeed] - Failed to load the feed with the following ID (sending 500 INTERNAL_SERVER_ERROR to client): ' + eventFeedKey + ' Error: ' + err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send('An error occurred finding an event source feed with the ID: ' + feedID + ' Error: ' + err);
            }
        });
}
