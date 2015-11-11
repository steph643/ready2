Ready2 = {

  //****** Public API ******

  // Activate Ready2 on the provided subscription handle
  activate: function(subHandle) {
    // Get the subscription id
    const subId = this._idFromHandle(subHandle);

    // Check for duplicate calls to "activate"
    if (this._activatedSubIds[subId])
      throw new Error('Ready2 has already been activated for this subscription');

    // Store the subscription id in our _activatedSubIds list
    this._activatedSubIds[subId] = true;

    // Check if the subscription handle has an onReady callback. If it has,
    // display a warning message
    const subRecord = Meteor.connection._subscriptions[subId];
    if (subRecord.readyCallback)
      console.log('Warning: Ready2 and onReady callbacks '
        + 'don\'t play well together (see the doc)');
  },

  // Deactivate Ready2 on the provided subscription handle
  deactivate: function(subHandle) {
    // Get the subscription id
    const subId = this._idFromHandle(subHandle);

    // Check for prior activation
    if (!this._activatedSubIds[subId])
      throw new Error('Ready2 hasn\'t been activated for this subscription');

    // Remove the subscription id from our _activatedSubIds list
    delete this._activatedSubIds[subId];
  },

  //****** Private API ******

  // This is where we are going to store subscriptions where Ready2 is
  // activated
  _activatedSubIds: {},

  // This is where we will save ready states, so that we can restore them if
  // login or logout fails
  _forUndo: null,

  // Get a subscription id from a subscription handle
  _idFromHandle: function(subHandle) {
    if (!subHandle || !_.has(subHandle, 'subscriptionId'))
      throw new Error('Ready2: invalid subscription handle');
    const subId = subHandle.subscriptionId;
    if (!Match.test(subId, String))
      throw new Error('Ready2: invalid subscription handle');
    if (!_.has(Meteor.connection._subscriptions, subId))
      throw new Error('Ready2: unknown subscription handle');
    return subId;
  },

  // Go through the activated subscriptions and set their Meteor ready state to
  // false
  _setReadyToFalse: function() {
    const self = this;

    // Prepare an array to store ready subscriptions (for undo purpose)
    self._forUndo = [];

    // Go through the activated subscriptions
    _.each(self._activatedSubIds, function(unused, subId) {
      // Get the subscription record
      const subRecord = Meteor.connection._subscriptions[subId];

      // If this subscription has been stopped, deactivate it and quit
      if (!subRecord) {
        delete self._activatedSubIds[subId];
        return;
      }

      // If the subscription is ready...
      if (subRecord.ready) {
        // Store it in our array
        self._forUndo.push(subRecord);

        // Mark it as not ready
        subRecord.ready = false;
        subRecord.readyDeps.changed();
      }
    });
  },

  _undoSetReadyToFalse: function() {
    // Check that _setReadyToFalse has been called
    if (!this._forUndo)
      throw new Error('Ready2: _setReadyToFalse must be called first');

    // Restore previous ready state
    _.each(this._forUndo, function(subRecord) {
      subRecord.ready = true;
      subRecord.readyDeps.changed();
    });

    // Undo is done
    this._forUndo = null;
  }
};

// When user logs in, set all subscriptions ready states to false.
// WE CANNOT DO THIS *ONCE* LOGIN IN DONE (by watching Meteor.userId() or
// Accounts.onLogin()). Indeed, once the client gets to know that a login is
// successful, the sever has already started to flood the client with new
// collection data, and Blaze might already be overwhelmed.
Tracker.autorun(function() {
  if (Meteor.loggingIn())
    Ready2._setReadyToFalse();
});

// If login has failed, Meteor won't send the subscription ready signal, so we
// need to restore previous ready states.
Accounts.onLoginFailure(function() {
  Ready2._undoSetReadyToFalse();
});

// When user logs out, set all subscriptions ready states to false.
// WE CANNOT DO THIS *ONCE* LOGOUT IN DONE (by watching Meteor.userId()).
// Indeed, once the client gets to know that a logout is
// successful, the sever has already started to flood the client with new
// collection data, and Blaze might already be overwhelmed.
const _logout = Meteor.logout;
Meteor.logout = function customLogout() {
  // Set all subscriptions ready states to false.
  Ready2._setReadyToFalse();

  // Logout the user
  _logout.apply(Meteor, arguments, function(error) {
    // If logout has failed, Meteor won't send the subscription ready signal,
    // so we need to restore previous ready states.
    if (error)
      Ready2._undoSetReadyToFalse();
  });
};
