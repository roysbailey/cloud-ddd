define(
    ['durandal/system', 'services/logger', 'knockout'],
    function(system, logger, ko) {

    var activate = function () {
        log('[Welcome] view activated', null, true);
    };

    var doSearch = function () {
        log('Search clicked!', vm.searchText(), true);
    };

    var vm = 
    {
        activate: activate,
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