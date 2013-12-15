define([
    'durandal/system',
    'services/logger'],
    function (system, logger) {

        var getProviderPartials = function (providersObservable, filter, forceRemote) {
            var spoofProviders = [
                {
                    ukprn: "1234567",
                    name: "Birmingham City Council",
                    city: "Birmingham"
                },
                {
                    ukprn: "ABCDEFG",
                    name: "Birmingham Special Society",
                    city: "Birmingham"
                },
                {
                    ukprn: "09876543",
                    name: "Council of Birmimgham",
                    city: "Birmingham"
                }
                ];

            // Filter our collection if a filter is specified
            if (filter) {
                spoofProviders = spoofProviders.filter(function(item, index, array) {
                    return item.name.indexOf(filter) != -1 || item.city.indexOf(filter) != -1;
                });
            }

            // Push the array into our observable.
            providersObservable(spoofProviders);
        }
        

        var datacontext = {
            getProviderPartials: getProviderPartials
        };

        return datacontext;

        //#region Internal methods        
        
        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(datacontext), showToast);
        }

        function logError(msg, error) {
            logger.logError(msg, error, system.getModuleId(datacontext), true);
        }
        //#endregion
});