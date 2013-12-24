define([
    'durandal/system',
    'services/logger'
    ,'services/providerdata'
    ],
    function (system, logger, providerData) {

        //var providerData = [
        //    {
        //        ukprn: "1234567",
        //        name: "Birmingham City Council",
        //        city: "Birmingham"
        //    },
        //    {
        //        ukprn: "ABCDEFG",
        //        name: "Birmingham Special Society",
        //        city: "Birmingham"
        //    },
        //    {
        //        ukprn: "09876543",
        //        name: "Council of Birmimgham",
        //        city: "Birmingham"
        //    }
        //    ];

        var getProviderPartials = function (providersObservable, filter, forceRemote) {
            var providers = providerData;

            // Filter our collection if a filter is specified
            if (filter) {
                providers = providerData.filter(function(item, index, array) {
                    return item.name.indexOf(filter) != -1 || item.city.indexOf(filter) != -1;
                });
            }

            // Push the array into our observable.
            providersObservable(providers);
        }
        
        var getProviderByUkprn = function(ukprn) {
            var provider = undefined;
            if (ukprn) {
                provider = providerData.filter(function(item, index, array) {
                    return item.ukprn == ukprn;
                });

                if (provider.length > 0) provider = provider[0];
                else provider = undefined;
            }

            return provider;
        };

        var createProvider = function() {
            return {
                ukprn: "",
                name: "",
                city: ""
                };
        };

        var saveProvider = function(provider) {
            providerData.forEach(function(item, i) { if (item.ukprn == provider.ukprn) providerData[i] = provider; });
        }

        var deleteProvider = function(ukprn) {
            providerData.forEach(function(item, i) { if (item.ukprn == ukprn) providerData.splice(i, 1); });
        }

        var refreshDB = function() {
            var providersJSON = JSON.stringify(providerData);

            jQuery.ajax({
                type: 'POST',
                url: "/api/refreshdb",
                data: providersJSON,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data){ 
                    alert(data); 
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
        
        var viewAttached = function(view) {
            bindEventToList(view, '.session-brief', gotoDetails);
        };

        var bindEventToList = function(rootSelector, selector, callback, eventName) {
            var eName = eventName || 'click';
            $(rootSelector).on(eName, selector, function() {
                var provider = ko.dataFor(this);
                callback(provider);
                return false;
            });
        };

        var gotoDetails = function(selectedProvider) {
            if (selectedProvider && selectedProvider.id()) {
                var url = '#/providerdetail/' + selectedProvider.ukprn();
                router.navigateTo(url);
            }
        };

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(datacontext), showToast);
        };

        function logError(msg, error) {
            logger.logError(msg, error, system.getModuleId(datacontext), true);
        };
        //#endregion
});