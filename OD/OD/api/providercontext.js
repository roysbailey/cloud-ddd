exports.refreshdb = function(db) {
    return function(req, res) {

        // Get our form values. These rely on the "name" attributes
        var newProviderList = req.body.providers;

        // Set our collection
        var collection = db.get('providers');
        collection.remove();

        // Submit to the DB
        collection.insert(
            newProviderList,
            function (err, doc) {
            if (err) {
                res.statusCode = 500;
            }
            else {
                res.statusCode = 200;
            }
        });

    }
}