const tape = require('tape');
const pull = require('pull-stream');
const Notify = require('pull-notify');
const ConnStaging = require('../lib');

const TEST_ADDR =
  'net:localhost:9752~shs:pAhDcHjunq6epPvYYo483vBjcuDkE10qrc2tYC827R0=';

tape('stage(), entries(), unstage(), entries()', t => {
  const connHub = {
    listen: () => pull.empty(),
    getState: () => undefined,
  };

  const connStaging = new ConnStaging(connHub);

  const address = TEST_ADDR;
  const result1 = connStaging.stage(address, {mode: 'internet', address});
  t.equals(result1, true, 'stage() succeeds');

  const entries1 = Array.from(connStaging.entries());
  t.equals(entries1.length, 1, 'there is one address in staging');
  const [actualAddress] = entries1[0];
  t.equals(actualAddress, TEST_ADDR, 'staged address is what we expected');

  const result2 = connStaging.unstage(address);
  t.equals(result2, true, 'unstage() succeeds');

  const entries2 = Array.from(connStaging.entries());
  t.equals(entries2.length, 0, 'there is nothing in staging');

  t.end();
});

tape('refuses to stage an already connected peer', t => {
  const connHub = {
    listen: () => pull.empty(),
    getState: () => 'connected',
  };

  const connStaging = new ConnStaging(connHub);

  const address = TEST_ADDR;
  const result1 = connStaging.stage(address, {mode: 'internet', address});
  t.equals(result1, false, 'stage() should refuse');

  const entries1 = Array.from(connStaging.entries());
  t.equals(entries1.length, 0, 'there is nothing in staging');

  t.end();
});

tape('refuses to stage redundantly', t => {
  const connHub = {
    listen: () => pull.empty(),
    getState: () => undefined,
  };

  const connStaging = new ConnStaging(connHub);

  const address = TEST_ADDR;
  const result1 = connStaging.stage(address, {mode: 'internet', address});
  t.equals(result1, true, 'stage() succeeds');

  const entries1 = Array.from(connStaging.entries());
  t.equals(entries1.length, 1, 'there is one address in staging');
  const [actualAddress] = entries1[0];
  t.equals(actualAddress, TEST_ADDR, 'staged address is what we expected');

  const result2 = connStaging.stage(address, {mode: 'internet', address});
  t.equals(result2, false, 'stage() should refuse');

  const entries2 = Array.from(connStaging.entries());
  t.equals(entries2.length, 1, 'there is (still) one address in staging');

  t.end();
});

tape('refuses to unstage redundantly', t => {
  const connHub = {
    listen: () => pull.empty(),
    getState: () => undefined,
  };

  const connStaging = new ConnStaging(connHub);

  const address = TEST_ADDR;
  const result1 = connStaging.unstage(address);
  t.equals(result1, false, 'unstage() should refuse');

  const entries1 = Array.from(connStaging.entries());
  t.equals(entries1.length, 0, 'there is nothing in staging');

  t.end();
});

tape('automatically unstage upon connHub "connected" event', t => {
  const notify = Notify();
  const connHub = {
    listen: () => notify.listen(),
    getState: () => undefined,
  };

  const connStaging = new ConnStaging(connHub);

  const address = TEST_ADDR;
  const result1 = connStaging.stage(address, {mode: 'internet', address});
  t.equals(result1, true, 'stage() succeeds');

  const entries1 = Array.from(connStaging.entries());
  t.equals(entries1.length, 1, 'there is one address in staging');
  const [actualAddress] = entries1[0];
  t.equals(actualAddress, TEST_ADDR, 'staged address is what we expected');

  notify({type: 'connected', address});
  t.pass('connHub emits "connected"');

  const entries2 = Array.from(connStaging.entries());
  t.equals(entries2.length, 0, 'there is nothing in staging');

  t.end();
});

tape('unstage only exactly what connHub "connected" event informed', t => {
  const notify = Notify();
  const connHub = {
    listen: () => notify.listen(),
    getState: () => undefined,
  };

  const connStaging = new ConnStaging(connHub);

  const address = TEST_ADDR;
  const result1 = connStaging.stage(address, {mode: 'internet', address});
  t.equals(result1, true, 'stage() succeeds');

  const entries1 = Array.from(connStaging.entries());
  t.equals(entries1.length, 1, 'there is one address in staging');
  const [actualAddress] = entries1[0];
  t.equals(actualAddress, TEST_ADDR, 'staged address is what we expected');

  notify({type: 'connected', address: 'net:unrelatedaddress.com:9009~noauth'});
  t.pass('connHub emits "connected" but for an unrelated address');

  const entries2 = Array.from(connStaging.entries());
  t.equals(entries2.length, 1, 'there is (still) one address in staging');

  t.end();
});
