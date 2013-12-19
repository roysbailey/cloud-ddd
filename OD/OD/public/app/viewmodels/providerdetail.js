define(
    ['durandal/app', 'plugins/router','durandal/system', 'services/logger', 'knockout', 'knockout.mapping', 'services/kodirty', 'services/datacontext'],
    function(app, router, system, logger, ko, komap, kodirty, datacontext) {

        var provider = ko.observable();
        
        var dirtyFlag = new kodirty.dirtyFlag(provider);

        var activate = function (routeData) {
            log('[providerdetail] view activated', routeData, true);

            loadProvider(routeData);
        };

        var goBack = function () {
            router.navigateBack();
        };

        var cancel = function () {
            loadProvider(provider().ukprn());
        };

        var isDeleting = ko.observable(false);

        var deleteProvider = function() {
            var msg = 'Delete provider [' + provider().ukprn() + '] ?';
            var title = 'Confirm Delete';
            isDeleting(true);
            return app.showMessage(msg, title, ['Yes', 'No'])
                .then(confirmDelete);
            
            function confirmDelete(selectedOption) {
                if (selectedOption === 'Yes') {
                    datacontext.deleteProvider(provider().ukprn());
                    router.navigate('#/');
                }
                isDeleting(false);
            }
        };

        var save = function() {
            // Convert our observable into a POJO and save
            var rawProvider = komap.toJS(provider);
            datacontext.saveProvider(rawProvider);
            router.navigate('#/');
        }

        var vm = {
            provider: provider,
            dirtyFlag: dirtyFlag,
            activate: activate,
            cancel: cancel,
            isDeleting: isDeleting,
            deleteProvider: deleteProvider,
            save: save
        } ;

        return vm;

        //#region Internal Methods

        function loadProvider(ukprn) {
            var prov = datacontext.getProviderByUkprn(ukprn);
            if (prov) {
                // Note. as we have "required" ko mapping as a module, it is NOT put into the "ko" object as "ko.mapping"
                // Instead, it is put into our "required" variable.
                // Therefore, instead of ... provider = ko.mapping.formJS(prov);  you do ..
                var obj = komap.fromJS(prov);
                provider(obj);
                // Note.  As the "provider" observable we are tracking has changed, we need 
                // to reset the dirty flag (as the previous object we were tracking may be dirty, but not the new one!)
                dirtyFlag.reset();
                log('Provider loaded and [observable]', provider().ukprn(), true);
            } else {
                dirtyFlag = { isDirty: ko.observable(false) };
            }
        }

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(vm), showToast);
        }

        //#endregion

    });