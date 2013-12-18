define(
    ['plugins/router','durandal/system', 'services/logger', 'knockout', 'knockout.mapping', 'services/kodirty', 'services/datacontext'],
    function(router, system, logger, ko, komap, kodirty, datacontext) {
    
        var provider = ko.observable();

        var dirtyFlag = ko.observable(false);

        var activate = function (routeData) {
            log('[providerdetail] view activated', routeData, true);

            var prov = datacontext.getProviderByUkprn(routeData);
            if (prov) {
                // Note. as we have "required" ko mapping as a module, it is NOT put into the "ko" object as "ko.mapping"
                // Instead, it is put into our "required" variable.
                // so, instead of this... provider = ko.mapping.formJS(prov);  you do this...
                var obj = komap.fromJS(prov);
                provider(obj);
                dirtyFlag = kodirty.dirtyFlag(provider);
                log('Provider loaded and [observable]', provider().ukprn(), true);
            }
        };

        var save = function() {
            // Convert our observable into a POJO and save
            var rawProvider = komap.toJS(provider);
            datacontext.saveProvider(rawProvider);
            router.navigate('#/');
        }

        var vm = 
        {
            activate: activate,
            provider: provider,
            save: save,
            dirtyFlag: dirtyFlag
        };

        return vm;

        //#region Internal Methods

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(vm), showToast);
        }




        //#endregion

    });