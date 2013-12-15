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
        
        var getProviderByUkprn = new function(ukprn) {
            if (ukprn) {
                providers = providerData.ukprn(function(item, index, array) {
                    return item.ukprn === ukprn;
                });
            }
        };

        var createProvider = new function() {
            return {
                ukprn: "",
                name: "",
                city: ""
                };
        };

        var datacontext = {
            getProviderPartials: getProviderPartials,
            createProvider: createProvider,
            getProviderByUkprn: getProviderByUkprn
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