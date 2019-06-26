# ssb-conn-staging

Module that manages potential and optional peer connections. For use with the SSB CONN family of modules. See also [ssb-conn-hub](https://github.com/staltz/ssb-conn-hub).

*Visual metaphor: a bench with substitute players, idle and not actively in the game, optionally available and waiting for further instructions to join or not.*

![staging.png](./staging.png)

## Usage

This module is only used to create an SSB CONN plugin, not used directly by applications. A ConnStaging instance should be available on the CONN plugin, with the following API:

## API

* `connStaging.stage(address, data)`: register a peer known by its `address` (string, must conform to the [multiserver address convention](https://github.com/dominictarr/multiserver-address)) as a newly available peer for potential connections, and a `data` object argument. Returns a boolean indicating whether stage() succeeded or not.
* `connStaging.unstage(address)`: remove the potential peer from the staging database, by its `address` (string, must conform to the multiserver address convention). Returns a boolean indicating whether unstage() succeeded or not
* `connStaging.entries()`: returns a new `Iterator` object that gives `[address, data]` pairs of the peers currently in staging
* `connStaging.listen()`: returns a pull stream that notifies of connection events, as an object `{type, address}` where `type` is either `'staged'` or `'unstaged'`
* `connStaging.close()`: terminates any used resources and listeners, in preparation to destroy this instance.


## License

MIT
