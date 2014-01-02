define(
    function (require) {

    var config = require('services/config');

    var dataContext = config.remoteMode ? require('services/datacontextremote') : require('services/datacontextlocal');

    return dataContext;

});