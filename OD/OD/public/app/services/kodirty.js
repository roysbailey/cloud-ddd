define(
    ['knockout'],
    function(ko) {
    var dirtyFlag = function(root, isInitiallyDirty) {
        var that = this;
        that._initialState = ko.observable(ko.toJSON(root));
        that._isInitiallyDirty = ko.observable(isInitiallyDirty);
        that.root = root;
        that._datetime = new Date();

        that.isDirty = ko.computed(function() {
            var localDate = that._datetime;
            return that._isInitiallyDirty() || that._initialState() !== ko.toJSON(that.root);
        });

        that.reset = function() {
            that._initialState(ko.toJSON(that.root));
            that._isInitiallyDirty(false);
        };
    }

    // Return our API to the outside world.
    // Clients would use vm.myDirtyFlag = new koDirty(myObservableEntity);
    // Note the use of "new"!
    var kodirty = {
        dirtyFlag: dirtyFlag
    };
    return kodirty;
});