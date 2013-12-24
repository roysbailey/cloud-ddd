define(
    ['plugins/router','durandal/system', 'services/logger', 'knockout', 'services/datacontext'],
    function(router, system, logger, ko, datacontext) {

        var activate = function () {
            if (vm.searchText())
                datacontext.getProviderPartials(providers, vm.searchText());
            log('[Welcome] view activated', null, true);
        };

        var attached = function(view) {
            bindEventToList('#provider-results', 'tr', gotoDetails);
        };

        var doSearch = function () {
            log('Search clicked!', vm.searchText(), true);
            datacontext.getProviderPartials(providers, vm.searchText());
        };

        var providers = ko.observableArray([]);

        var refreshDB = function() {
            datacontext.refreshDB();
        }

        var vm = 
        {
            activate: activate,
            attached: attached,
            doSearch: doSearch,
            displayName: "Organisation Directory",
            description: "Welcome to the Organisation Directory.  Please use the options below to select what you would like to do next",
            providers: providers,
            searchText: ko.observable(""),
            refreshDB: refreshDB
        };

        return vm;

        //#region Internal Methods

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(vm), showToast);
        }

        function bindEventToList(rootSelector, selector, callback, eventName) {
            var eName = eventName || 'click';
            var parentItem = $(rootSelector);
            parentItem.on(eName, selector, function() {
                var provider = ko.dataFor(this);
                callback(provider);
                return false;
            });
        };

        function gotoDetails(selectedProvider) {
            if (selectedProvider && selectedProvider.ukprn) {
               log('Selected provider to view', selectedProvider, true);
               var url = '#/providerdetail/' + selectedProvider.ukprn;
               log('Navigate to provider to view', url, true);
               router.navigate(url);
            }
        };

        //#endregion
    });