# Ready2

An experimental package to help with Meteor issue [#4705](https://github.com/meteor/meteor/issues/4705).

## Installation

```
$ meteor add steph643:ready2
```

## Feature

[Meteor.subscribe()](http://docs.meteor.com/#/full/meteor_subscribe) returns a handle 
containing a ready() method. This method allows to reactively check if the subscription is ready, 
i.e. if the **initial burst of data** has been uploaded to the client. 
The ready() method doesn't inform you of subsequent data changes. 

When user logs in or out, [all subscriptions are rerun](http://docs.meteor.com/#/full/publish_userId). 
Eventhough this might imply a large quantity of data to be uploaded to - or removed from - the client, 
the ready() method doesn't fire anymore. This might be a problem in some cases.

**This package changes the ready() method behavior, to make it fire also when user logs in or out**.

## Why would I need this?

It is well known that Blaze (Meteor rendering engine) is not good at handling large amounts 
of reactive data changes. The usual workaround is to stop Blaze
reactive rendering, to load the new data, then to turn Blaze back on when data is ready.

This pattern works nice in most cases, but is difficult to implement in the login/logout
case, because there is no easy way to know when data is ready. Hence this package.

## API

The API is **client-only**.

#### Ready2.activate(subHandle)

Activate Ready2 behavior on the subscription whose handle is passed as a parameter. 

After Ready2.activate() has been called, the ready() method:
* will return false reactively when the subscription is rerun (see important limitations below), and
* will return true reactively after the subscription has rerun and data is ready.

#### Ready2.deactivate(subHandle)

Cancel Ready2 behavior on the subscription whose handle is passed as a parameter.

## Why this is not the ideal fix

This package has several limitations.
* The ready() method will return false reactively when user logs in *even if login fails*.
* The ready() method will return false reactively when user logs out *even if logout fails*.
* The ready() method will return false reactively when user logs in/out *even if no data has changed*.
* Ready2 will make your onReady callbacks to be called whenever data is ready after user logs in/out. This 
might sound good, but is actually useless because there is no onNotReadyAnymore callback to inform you that
data were previously not ready. So my advice is to avoid setting onReady callbacks when using Ready2. If you 
do anyway, a warning will be displayed in the console.

## License

Ready2 is licensed under the MIT License.
