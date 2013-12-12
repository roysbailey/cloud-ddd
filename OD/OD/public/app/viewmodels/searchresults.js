define(
    ['knockout', 'services/datacontext'],
    function(ko, datacontext) {
    
        var searchFilter = ko.observable();
        var providers = ko.observableArray();

        var activate = function (routeData) {
            searchFilter(routeData);
            datacontext.getProviderPartials(providers);
        };

        var vm = 
        {
            activate: activate,
            searchFilter: searchFilter,
            providers: providers
        };

        return vm;
    });