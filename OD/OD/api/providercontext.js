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
            if (err) {
                var error = {
                    msg: "Failed to update providers",
                    error: err
                    };
                res.json(error);
            } else {
                var success = {
                    msg: "Providers updated ok"
                    };
                res.json(success);
            }
        });
    };
};
    

exports.getProviderByUKPRN = function(db) {
    return function(req, res) {
        // Get the ukprn of the provider we need to load
        var ukprnInt = parseInt(req.params.ukprn);
    
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

