define(
    ['plugins/router','durandal/system', 'services/logger', 'knockout', 'knockout.mapping', 'services/kodirty', 'services/datacontext'],
    function(router, system, logger, ko, komap, kodirty, datacontext) {

        var vm = function() {

            var that = this;

            that.provider = ko.observable();
        
            that.dirtyFlag = ko.observable(false);

            that.activate = function (routeData) {
                log('[providerdetail] view activated', routeData, true);

                var prov = datacontext.getProviderByUkprn(routeData);
                if (prov) {
                    // Note. as we have "required" ko mapping as a module, it is NOT put into the "ko" object as "ko.mapping"
                    // Instead, it is put into our "required" variable.
                    // so, instead of that... provider = ko.mapping.formJS(prov);  you do that...
                    var obj = komap.fromJS(prov);
                    that.provider(obj);
                    that.dirtyFlag = new kodirty.dirtyFlag(that.provider);
                    log('Provider loaded and [observable]', that.provider().ukprn(), true);
                } else {
                    that.dirtyFlag = ko.observable(false);
                }
            };

            that.save = function() {
                // Convert our observable into a POJO and save
                var rawProvider = komap.toJS(that.provider);
                datacontext.saveProvider(rawProvider);
                router.navigate('#/');
            }
        }

        return new vm();

        //#region Internal Methods

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(vm), showToast);
        }

        //#endregion

    });