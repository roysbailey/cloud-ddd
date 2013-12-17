define(
    ['durandal/system', 'services/logger', 'knockout', 'knockout.mapping', 'services/datacontext'],
    function(system, logger, ko, komap, datacontext) {
    
        var provider = {};

        var activate = function (routeData) {
            log('[providerdetail] view activated', routeData, true);

            var prov = datacontext.getProviderByUkprn(routeData);
            if (prov) {
                // Note. as we have "required" ko mapping as a module, it is NOT put into the "ko" object as "ko.mapping"
                // Instead, it is put into our "required" variable.
                // so, instead of this... provider = ko.mapping.formJS(prov);  you do this...
                provider = komap.fromJS(prov);
                log('Provider loaded and [observable]', provider.ukprn(), true);
            }
        };

        var vm = 
        {
            activate: activate,
            provider: provider
        };

        return vm;

        //#region Internal Methods

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(vm), showToast);
        }

        //#endregion

    });