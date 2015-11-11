Package.describe({
  name: 'steph643:ready2',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Experimental fix for Meteor issue #4705 about subscription readiness',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/steph643/ready2.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['tracker', 'underscore', 'accounts-base', 'ecmascript', 'check']);
  api.addFiles('ready2.js', 'client');
  api.export('Ready2');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('steph643:ready2');
});
