const pull = require('pull-stream');
const Notify = require('pull-notify');
const msAddress = require('multiserver-address');
const debug = require('debug')('ssb:conn-staging');
import ConnHub = require('ssb-conn-hub');
import {ListenEvent as HubEvent} from 'ssb-conn-hub/lib/types';
import {ListenEvent, Address, StagedData} from './types';

class ConnStaging {
  private readonly _hub: ConnHub;
  private readonly _peers: Map<Address, StagedData>;
  private readonly _notifyEvent: any;

  constructor(connHub: ConnHub) {
    this._hub = connHub;
    this._peers = new Map<Address, StagedData>();
    this._notifyEvent = Notify();
    this._init();
  }

  //#region PRIVATE

  private _init() {
    pull(
      this._hub.listen(),
      pull.drain((ev: HubEvent) => {
        if (ev.type === 'connected') {
          this.unstage(ev.address);
        }
        if (ev.type === 'disconnected') {
          // TODO ping this address to see if it's worth re-staging it
        }
      }),
    );

    // TODO periodically ping staged peers and unstage those that dont respond
    // How should we do this without issuing an ssb-server::connect() ?
    // Perhaps creating a new multiserver client?
    // But then we need to load all the custom multiserver plugins too
  }

  private _assertValidAddress(address: Address) {
    if (!msAddress.check(address)) {
      throw new Error('The given address is not a valid multiserver-address');
    }
  }

  //#endregion

  //#region PUBLIC API

  public stage(address: Address, data: StagedData): boolean {
    this._assertValidAddress(address);

    if (!!this._hub.getState(address)) return false;
    if (this._peers.has(address)) return false;

    this._peers.set(address, data);
    debug('staged peer %s', address);
    this._notifyEvent({type: 'staged', address} as ListenEvent);
    return true;
  }

  public unstage(address: Address): boolean {
    this._assertValidAddress(address);

    if (!this._peers.has(address)) return false;

    this._peers.delete(address);
    debug('unstaged peer %s', address);
    this._notifyEvent({type: 'unstaged', address} as ListenEvent);
    return true;
  }

  public entries() {
    return this._peers.entries();
  }

  public listen() {
    return this._notifyEvent.listen();
  }

  //#endregion
}

export = ConnStaging;
