define(['durandal/system', 'services/logger', 'services/providerdata'],
    function (system, logger, providerData) {

    // var getProviderPartials = function (providersObservable, filter, forceRemote) {
    //     var providers = providerData;

    //     // Filter our collection if a filter is specified
    //     if (filter) {
    //         providers = providerData.filter(function(item, index, array) {
    //             return item.name.indexOf(filter) != -1 || item.city.indexOf(filter) != -1;
    //         });
    //     }

    //     // Push the array into our observable.
    //     providersObservable(providers);
    // }

    var getProviderPartials = function (providersObservable, filter, forceRemote) {
        
        return $.getJSON( "/api/providers/", { filter: filter })
            .done(function( data ) {
                // Push the array into our observable.
                providersObservable(data); 
            });
    }

    
    var getProviderByUkprn = function(ukprn) {
        // Return the "promise" from this, so we can "await" a result in the caller.
        return $.getJSON( "/api/providers/" + ukprn);
    };

    var createProvider = function() {
        return {
            ukprn: "",
            name: "",
            city: ""
            };
    };

    var saveProvider = function(provider) {
        log('Update provider started', provider.ukprn, true);
        
        var providerPayload = JSON.stringify(provider);

        return jQuery.ajax({
            type: 'PUT',
            url: "/api/providers/" + provider.ukprn,
            data: providerPayload,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){ 
                log('Update providers completed', data, true); 
            },
            error: function(jqXHR, textStatus, errorThrown) {
                logError("Update provider failed", "Error back from save:" + errorThrown);
            }                
        });    
    }

    var deleteProvider = function(ukprn) {
        providerData.forEach(function(item, i) { if (item.ukprn == ukprn) providerData.splice(i, 1); });
    }

    var refreshDB = function() {
        var providersJSON = JSON.stringify(providerData);

        log('Refresh providers started', null, true);

        jQuery.ajax({
            type: 'POST',
            url: "/api/refreshdb",
            data: providersJSON,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){ 
                log('Refresh of providers completed', data, true); 
            },
            error: function(jqXHR, textStatus, errorThrown) {
                logError("Refresh of providers failed", "Error back from save:" + errorThrown);
            }                
        });
    }

    var datacontext = {
        saveProvider: saveProvider,
        getProviderPartials: getProviderPartials,
        createProvider: createProvider,
        getProviderByUkprn: getProviderByUkprn,
        deleteProvider: deleteProvider,
        refreshDB: refreshDB
    };

    return datacontext;

    //#region Internal methods        
    
    function log(msg, data, showToast) {
        logger.log(msg, data, system.getModuleId(datacontext), showToast);
    };

    function logError(msg, error) {
        logger.logError(msg, error, system.getModuleId(datacontext), true);
    };
    //#endregion
});