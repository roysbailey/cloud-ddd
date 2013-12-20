define(
    ['knockout'],
    function(ko) {

    // This is effectively our "dirtyFlag" object with all the functionality.
    var dirtyFlag = function(root, isInitiallyDirty) {
        // Holds the state of the observale we are tracking (as a raw json string) at the 
        // time we start tracking.  We compare this later to see if the current state of the 
        // object has changed.
        var _initialState = ko.observable(ko.toJSON(root));             
        var _isInitiallyDirty = ko.observable(isInitiallyDirty);

        // Main computed for UI binding.  Use as follows:
        // data-bind="visible: dirtyFlag.isDirty"
        var isDirty = ko.computed(function() {
            return _isInitiallyDirty() || _initialState() !== ko.toJSON(root);
        });

        // Call this to reset tracking.  So we reset our initial state to the current
        // state of the object we are tracking, which takes us back to "not dirty"
        var reset = function() {
            _initialState(ko.toJSON(root));
            _isInitiallyDirty(false);
        };

        var api = {
            isDirty: isDirty,
            reset: reset
        };

        return api;
    }

    // This is our object we return via requirejs, which exposes the dirty functionality
    // This could be added to to use different methods.
    var kodirty = {
        dirtyFlag: dirtyFlag
    };

    return kodirty;
});