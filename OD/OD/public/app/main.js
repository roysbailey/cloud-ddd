requirejs.config({
    paths: {
        'text': '../scripts/bower_components/requirejs-text/text',
        'durandal':'../scripts/bower_components/durandal/js',
        'plugins' : '../scripts/bower_components/durandal/js/plugins',
        'transitions' : '../scripts/bower_components/durandal/js/transitions',
        'knockout': '../scripts/bower_components/knockout.js/knockout',
        'bootstrap': '../scripts/bower_components/bootstrap/dist/js/bootstrap',
        'jquery': '../scripts/bower_components/jquery/jquery'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
       }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator'],  function (system, app, viewLocator) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.title = 'Org Directory';

    app.configurePlugins({
        router:true,
        dialog: true,
        widget: true
    });

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });
});