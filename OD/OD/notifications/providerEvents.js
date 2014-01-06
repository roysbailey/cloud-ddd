/**
 * Created by rbailey on 06/01/14.
 */

var AWS = require('aws-sdk');
var esConfigConstants = require('../services/esconfig').esConfigConstatnts;
var httpStatus = require('http-status');


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
            console.log("Current event feed:" + currentEventFeed);

            // Load the "current feed"
            var eventFeedKey = esConfigConstants.EVENT_FEED_KEY_NAME_PREFIX + currentEventFeed;
            s3.getObject(
                {Bucket: esConfigConstants.EVENT_BUCKET_NAME,
                    Key: eventFeedKey,
                    ResponseContentType: esConfigConstants.RESPONSE_CONTENT_TYPE},
                function(err, data) {
                var eventFeedObj;
                if (!err) {
                    console.log('Loaded the existing feed.');
                    var eventFeedJsonBody = data.Body.toString();
                    eventFeedObj = JSON.parse(eventFeedJsonBody);

                    // Now, we need to modify the relationship exposed to reflect this is the "recent" feeds they are looking at.
                    // See "REST in Practice" page: 194 / 212
                    eventFeedObj._links.via = {href: eventFeedObj._links.self.href};
                    eventFeedObj._links.self.href = '/provider/notifications';

                    // Convert to a Json string to send back to the client.
                    var eventFeedJson = JSON.stringify(eventFeedObj);
                    res.json(eventFeedJson);
                }
            });
        }
    });
}

exports.getNotificationFeed = function(req, resp) {

}
