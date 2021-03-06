var httpStatus = require('http-status');
var evSource = require('../services/eventpublication');
var cacheConfig = require('../services/cacheConfig').cacheConfig;

exports.refreshdb = function(db) {
    return function(req, res) {
        // Blank the current collection
        var collection = db.get('providers');
        collection.remove();

        // Add version to each provider, so we can do ETag type stuff going forward
        var newProviderList = req.body;
        newProviderList.forEach(function(provider) {
           provider.version = 1;
        });

        collection.insert(
            newProviderList,
            function (err, doc) {
                if (!err) {
                    var success = {
                        msg: "Providers updated ok"
                    };
                    res.json(success);
                } else {
                    var error = {
                        msg: "Failed to update providers",
                        error: err
                    };
                    res.json(error);
                }
        });
    };
};

exports.deleteProvider = function(db) {
    return function(req, res) {
        var ukprnInt = parseInt(req.params.ukprn, 10);
    
        // Set our collection
        var collection = db.get('providers');
    
        collection.remove(
            { ukprn: ukprnInt }, 
            function(err, numDocs) {
            if (err) {
                var error = {
                    msg: "Failed to delete provider: [" + ukprnInt + "]",
                    error: err
                    };
                res.json(error);
            } else {
                evSource.publishEvent(ukprnInt, 'delete');
                res.send(httpStatus.NO_CONTENT);
            }
        });
    };
};    

exports.getProvider = function(db) {
    return function(req, res) {
        // Get the ukprn of the provider we need to load
        var ukprnInt = parseInt(req.params.ukprn, 10);
        console.log('[API].[getProvider] - Try and load provier with ukprn: ' + ukprnInt);

        // Set our collection
        var collection = db.get('providers');
    
        collection.findOne(
            { ukprn: ukprnInt }, 
            function(err, docs) {
            if (err) {
                console.log('[API].[getProvider] - Failed to load provider with ukprn: ' + ukprnInt + ' Error: ' + err);
                var error = {
                    msg: "Failed to load provider: [" + ukprnInt + "]",
                    error: err
                    };
                res.json(error);
            } else {
                var providerETag = makeETag(docs);
                console.log('[API].[getProvider] - Loaded Provider: ' + ukprnInt + ' current ETag: ' + providerETag + ' ETag from if-none-match request: ' + req.headers['if-none-match']);
                if (req.headers['if-none-match'] === providerETag){
                    console.log('[API].[getProvider] - Provider: ' + ukprnInt + ' has NOT not, returning 304 - NOT_MODIFIED (and no http response body)');
                    res.send(httpStatus.NOT_MODIFIED);
                } else {
                    console.log('[API].[getProvider] - Provider: ' + ukprnInt + ' HAS changed, returning 200, with response headers: cache-control: ' + cacheConfig.readProvider_CacheControl  + ' and ETag: ' + providerETag);
                    res.setHeader('Cache-Control', cacheConfig.readProvider_CacheControl);
                    res.setHeader('ETag', providerETag);
                    res.json(docs);
                }
            }
        });

        function makeETag(provider) {
            var etag = provider.ukprn + '_' + provider.version;
            return etag;
        }
    };
};

exports.updateProvider = function(db) {
    return function(req, res) {
        // Increment the version number of the provider being updated.
        var provider = req.body;
        provider.version++;

        // Update the provider in Mongo.
        var collection = db.get('providers');
        collection.update(
            { _id: provider._id }, 
            provider,
            function(err, doc) {
            if (err) {
                var error = {
                    msg: "Failed to update provider: [" + provider.ukprn + "]",
                    error: err
                    };
                res.json(error);
            } else {
                evSource.publishEvent(provider, 'update');
                res.json(doc);
            }
        });
    };
};

exports.getProviders = function(db) {
    return function(req, res) {
        // Get the filter string if we have one
        var filterQuery = req.query.filter;
        var filter = {};
        if (filterQuery) {
            filter = {
                $or: [ { name: { $regex: ".*" + filterQuery +".*", $options: 'i' } }, { city: { $regex: ".*" + filterQuery +".*", $options: 'i' } } ] 
                // name: { $regex: ".*" + filterQuery +".*", $options: 'i' } 
                };
        }

        // Set our collection
        var collection = db.get('providers');
    
        collection.find(
            filter, 
            function(err, docs) {
            if (err) {
                var error = {
                    msg: "Failed to load providers",
                    error: err
                    };
                res.json(error);
            } else {
                res.json(docs);
            }
        });

    };
};



