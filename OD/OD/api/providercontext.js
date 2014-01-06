var httpStatus = require('http-status');
var evSource = require('../services/eventpublication');

exports.refreshdb = function(db) {
    return function(req, res) {
        // Get the list of providers from the body.
        var newProviderList = req.body;
    
        // Set our collection
        var collection = db.get('providers');
        collection.remove();
    
        // Submit to the DB
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
    
        // Set our collection
        var collection = db.get('providers');
    
        collection.findOne(
            { ukprn: ukprnInt }, 
            function(err, docs) {
            if (err) {
                var error = {
                    msg: "Failed to load provider: [" + ukprnInt + "]",
                    error: err
                    };
                res.json(error);
            } else {
                res.json(docs);
            }
        });
    };
};

exports.updateProvider = function(db) {
    return function(req, res) {
        var provider = req.body;

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



