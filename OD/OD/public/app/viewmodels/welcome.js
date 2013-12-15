define(
    ['plugins/router','durandal/system', 'services/logger', 'knockout', 'services/datacontext'],
    function(router, system, logger, ko, datacontext) {

        var providers = ko.observableArray([]);

        var activate = function () {
            log('[Welcome] view activated', null, true);
        };

        var doSearch = function () {
            log('Search clicked!', vm.searchText(), true);
            datacontext.getProviderPartials(providers, vm.searchText());
        };

        var viewAttached = function(view) {
            bindEventToList(view, '.session-brief', gotoDetails);
        };

        var vm = 
        {
            activate: activate,
            providers: providers,
            displayName: "Organisation Directory",
            description: "Welcome to the Organisation Directory.  Please use the options below to select what you would like to do next",
            doSearch: doSearch,
            searchText: ko.observable("")
        };

        return vm;

        //#region Internal Methods

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(vm), showToast);
        }

        //#endregion
    });