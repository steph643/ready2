//------------------------------------------------------------------------------
// Collection
//------------------------------------------------------------------------------

Items = new Mongo.Collection('items');

//------------------------------------------------------------------------------
// Client code
//------------------------------------------------------------------------------

if (Meteor.isClient) {

  // We'll store in here whether or not Ready2 is activated on the subscription
  Session.set('isActivated', false);

  Template.body.onCreated(function() {
    const self = this;

    // Subscribe to the Items collection and store the handle for futur use
    self.subHandle = self.subscribe('items', function onReady() {
      // Display a console message when the onReady callback is called
      console.log('onReady callback');
    });

    // Watch the subscription ready state and display a console message when it
    // changes
    self.autorun(function() {
      console.log('subscriptionsReady = ' + self.subscriptionsReady());
    });
  });

  Template.body.helpers({
    isActivated: function() { return Session.get('isActivated'); },
    items      : function() { return Items.find({}); }
  });

  Template.body.events({
    // When clicking the "activate" button, activate Ready2 on the subscription
    // handle and display a console message
    'click #activateDeactivate': function() {
      const isActivated = !Session.get('isActivated');
      const subHandle = Template.instance().subHandle;
      if (isActivated) {
        Ready2.activate(subHandle);
        console.log('++++ ready2 activated ++++');
      } else {
        Ready2.deactivate(subHandle);
        console.log('---- ready2 deactivated ----');
      }
      Session.set('isActivated', isActivated);
    },

    // Log the 'paul' user in
    'click #login': function() {
      Meteor.loginWithPassword('paul', 'qwerty');
    },

    // Log the 'paul' user out
    'click #logout': function() {
      Meteor.logout();
    },

    // Log the 'paul' user in with an incorrect password
    'click #failedLogin': function() {
      Meteor.loginWithPassword('paul', 'incorrectPassword');
    }
  });

}

//------------------------------------------------------------------------------
// Server code
//------------------------------------------------------------------------------

if (Meteor.isServer) {

  // Create the 'paul' user
  Meteor.users.remove({});
  Accounts.createUser({
    username: 'paul',
    email   : 'paul@gmail.com',
    password: 'qwerty'
  });

  // Fill our Items collection with 3 names
  Meteor.startup(function() {
    Items.remove({});
    Items.insert({ name: 'Elise' });
    Items.insert({ name: 'John' });
    Items.insert({ name: 'Dora' });
  });

  // Publish the Item collection if user is logged-in
  Meteor.publish('items', function() {
    return this.userId ? Items.find({}) : this.ready();
  });

}
