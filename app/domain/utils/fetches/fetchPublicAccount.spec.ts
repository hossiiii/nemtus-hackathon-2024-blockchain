import fetch from 'node-fetch';
global.fetch = fetch;

import { Address, PublicAccount } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { fetchPublicAccount } from './fetchPublicAccount';

describe('fetchPublicAccount', () => {
  it('should return an PublicAccount object', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );
    const result = await fetchPublicAccount(momijiBlockChain, momijiAddress);
    console.log(result);
    expect(result).toBeInstanceOf(PublicAccount);
  }, 10000); // 10 seconds
  it('should throw an error if targetAddressの公開鍵が0000', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAddress = Address.createFromRawAddress(
      'TAOLQGT43Q4VYTFOWDUFHR3DY2ZAVO6NI24HBMQ',
    );
    await expect(fetchPublicAccount(momijiBlockChain, momijiAddress)).rejects.toThrow(
      'targetAddressの公開鍵が0000..であるためPublicAccountをfetchできません',
    );
  }, 10000); // 10 seconds
});
