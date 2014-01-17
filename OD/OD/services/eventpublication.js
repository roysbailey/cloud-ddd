/**
 * Created by rbailey on 03/01/14.
 */

var AWS = require('aws-sdk');
var esConfig = require('./esconfig').esConfig;
var esConfigConstants = require('./esconfig').esConfigConstatnts;
var DateTime = require('./DateTime').DateTime;

exports.publishEvent = function(provider, eventType) {
    var ukprn = eventType === 'delete' ? provider : provider.ukprn;
    console.log('[ES].[publishEvent] - Create a [' + eventType + '] event for provider: ' + ukprn);

    // Load config to see what the current event feed ID is.
    var s3 = new AWS.S3();
    s3.getObject({Bucket: esConfigConstants.EVENT_BUCKET_NAME, Key: esConfigConstants.EVENT_CONFIG_KEY_NAME, ResponseContentType: esConfigConstants.RESPONSE_CONTENT_TYPE}, function(err, data) {
        var currentEventFeed;
        if (!err) {
            var jsonBody = data.Body.toString();
            var conf = JSON.parse(jsonBody);
            currentEventFeed = conf.currentEventFeed;
            console.log("[ES].[publishEvent] - Current event feed ID from config: " + currentEventFeed);

            // Lets see if the feed already exists
            var eventFeedKey = esConfigConstants.EVENT_FEED_KEY_NAME_PREFIX + currentEventFeed;
            s3.getObject({Bucket: esConfigConstants.EVENT_BUCKET_NAME, Key: eventFeedKey, ResponseContentType: esConfigConstants.RESPONSE_CONTENT_TYPE}, function(err, data) {
                var eventFeedObj;
                if (!err) {
                    console.log('[ES].[publishEvent] - Loaded existing feed: ' + currentEventFeed);
                    var eventFeedJsonBody = data.Body.toString();
                    eventFeedObj = JSON.parse(eventFeedJsonBody);
                    if (eventFeedObj.entries.length >= esConfig.eventsPerFeed) {
                        console.log("[ES].[publishEvent] - Current feed: [" + currentEventFeed + '] is full, need new feed, so increment current Feed ID');
                        conf.currentEventFeed++;
                        var strConfig = JSON.stringify(conf);
                        s3.putObject({Bucket: esConfigConstants.EVENT_BUCKET_NAME, Key: esConfigConstants.EVENT_CONFIG_KEY_NAME, Body: strConfig}, function(err, data) {
                            if (!err) {
                                console.log("[ES].[publishEvent] - Successfully updated config with new [current] feed ID: " + conf.currentEventFeed);
                            } else {
                                console.log("[ES].[publishEvent] - Failed to update config with new [current] feed ID: " + conf.currentEventFeed + ' - Error: ' + err);
                            }
                        });

                        // Add the "next-archive" _link to the feed we are just closing, to point to the new one we are opening and save it
                        eventFeedObj._links.nextArchive = {
                            href: '/providers/notifications/' + conf.currentEventFeed
                        };
                        var closedEventFeed = JSON.stringify(eventFeedObj);
                        (function(key) {
//                          Due to the callback used below, we need to use a closure to capture the current value of eventFeedKey, so it is not modified in
//                          the async callback scope, when it is modified below.
//                          See http://stackoverflow.com/questions/19043145/mongodb-and-node-js-asynchronous-programming
                            s3.putObject({Bucket: esConfigConstants.EVENT_BUCKET_NAME, Key: key, Body: closedEventFeed}, function(err, data) {
                                if (!err) {
                                    console.log("[ES].[publishEvent] - Successfully updated full feed: " + key + ' to point next-archive to: ' + conf.currentEventFeed);
                                } else {
                                    console.log("[ES].[publishEvent] - Failed to update full feed: " + key + ' to point next-archive to: ' + conf.currentEventFeed + ' Error: ' + err);
                                }
                            });
                        })(eventFeedKey);

                        // Now, lets create a new feed object for the current event, and allocate a new ket for it
                        currentEventFeed = conf.currentEventFeed;
                        eventFeedKey = esConfigConstants.EVENT_FEED_KEY_NAME_PREFIX + currentEventFeed;
                        eventFeedObj = createNewFeedObject(currentEventFeed);
                    }
                } else if (err.code === esConfigConstants.ERROR_NO_SUCH_KEY) {
                    console.log("[ES].[publishEvent] - Feed for current key not found (should only happen for first feed), lets create a new one: " + eventFeedKey);
                    eventFeedObj = createNewFeedObject(currentEventFeed);
                } else {
                    console.log(err);
                }

                if (eventFeedObj) {
                    // Create a new entry for this event, and add it to the feed.
                    addNewFeedEntry(eventFeedObj, provider, eventType);
                    var strNewEventFeed = JSON.stringify(eventFeedObj);
                    s3.putObject({Bucket: esConfigConstants.EVENT_BUCKET_NAME, Key: eventFeedKey, Body: strNewEventFeed}, function(err, data) {
                        if (!err) {
                            console.log("[ES].[publishEvent] - Successfully added new event for provider: " + ukprn + ' to event feed: ' + eventFeedKey);
                        } else {
                            console.log("[ES].[publishEvent] - Failed to add new event for provider: " + ukprn + ' to event feed: ' + eventFeedKey + ' Error: ' + err);
                        }
                    });
                }
            });
        }
    });
};

function createNewFeedObject(currentEventFeed) {
    // Create a new HAL feed to represent the events on providers
    var halEventFeed = {
        id: currentEventFeed,
        title: 'Organisation Directory Notifications',
        author: 'Organisation Directory',
        updated: '',
        _links: {
            self: { href: '/providers/notifications/' + currentEventFeed }
        },
        entries: []
    };

    if (currentEventFeed > 1){
        halEventFeed._links.previousArchive = {
          href: '/providers/notifications/' + (currentEventFeed-1)
        };
    }

    return halEventFeed;
}

function addNewFeedEntry(feed, provider, eventType) {
    var dt = new DateTime();
    var ukprn = eventType === 'delete' ? provider : provider.ukprn;
    var id = ukprn + '_' + dt.formats['constants']['atom'];

    var entry = {
        id: id,
        title: 'Provider [' + eventType + ']',
        createdDate: dt.formats['compound']['mySQL'],
        _links: {
            related: { href: '/api/providers/' + ukprn }
        },
        category: [
            { scheme: 'type', term: 'Provider' },
            { scheme: 'event', term: eventType }
        ],
        content: {
            type: 'application/vnd.orgdir+json',
            ukprn: ukprn
        }
    };
    
    if (eventType === 'update') {
        // For update, we need to add the current attribute values of the "provider" (not so for delete)
        entry.content.name = provider.name;
        entry.content.alias = provider.alias;
        entry.content.flatName = provider.flatName;
        entry.content.buildingName = provider.buildingName;
        entry.content.locality = provider.locality;
        entry.content.street = provider.street;
        entry.content.city = provider.city;
        entry.content.postCode = provider.postCode;
        entry.content.website = provider.website;
        entry.content.contactpostCode = provider.contactpostCode;
        entry.content.version = provider.version;
    }

    // Add the new entry to the feed and update our feeds 'updated' date.
    feed.entries.push(entry);
    feed.updated = dt.formats['compound']['mySQL'];

    return entry;
}