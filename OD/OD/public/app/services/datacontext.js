define([
    'durandal/system',
    'services/logger'],
    function (system, logger) {

        var getProviderPartials = function (providersObservable, forceRemote) {
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