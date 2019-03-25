# ssb-conn-staging

Module that manages potential and optional peer connections. For use with the SSB CONN family of modules. See also [ssb-conn-hub](https://github.com/staltz/ssb-conn-hub).

*Visual metaphor: a bench with substitute players, idle and not actively in the game, optionally available and waiting for further instructions to join or not.*

![staging.png](./staging.png)

## Usage

This module is only used to create an SSB CONN plugin, not used directly by applications. Example below:

```js
const ConnHub = require('ssb-conn-hub')
const ConnStaging = require('ssb-conn-staging')

const connPlugin = {
  name: 'conn',
  version: '1.0.0',
  manifest: {
    add: 'sync'
  },
  init: function(server) {
    const connHub = new ConnHub(server);
    const connStaging = new ConnStaging(connHub);
    return {
      add: function(address, data) {
        connStaging.stage(address, data);
      },
    };
  }
};
```

## API

* `new ConnStaging(connHub)`: constructor for a connStaging instance, accepting an `ssb-conn-hub` instance as argument
* `connStaging.stage(address, data)`: register a peer known by its `address` (string, must conform to the [multiserver address convention](https://github.com/dominictarr/multiserver-address)) as a newly available peer for potential connections, and a `data` object argument. Returns a boolean indicating whether stage() succeeded or not.
* `connStaging.unstage(address)`: remove the potential peer from the staging database, by its `address` (string, must conform to the multiserver address convention). Returns a boolean indicating whether unstage() succeeded or not
* `connStaging.entries()`: returns a new `Iterator` object that gives `[address, data]` pairs of the peers currently in staging
* `connStaging.listen()`: returns a pull stream that notifies of connection events, as an object `{type, address}` where `type` is either `'staged'` or `'unstaged'`

## License

MIT
