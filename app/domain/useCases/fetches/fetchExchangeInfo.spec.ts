import fetch from 'node-fetch';
global.fetch = fetch;

import { Account } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { fetchExchangeInfo } from './fetchExchangeInfo';

describe('fetchExchangeInfo', () => {
  it('should return a exchangeInfo from user', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = '0B436B10199D53276565E5BB71AF1E02A9928DAC9BD0006EFFEC41F45F0980E8';
    const momijiUserAccount = Account.createFromPrivateKey('D8A03500647C68D715FD2B9C043D6E20EEADE2D4FE7B88DA5F84C240B00C7DC2', momijiBlockChain.networkType);
    const result = await fetchExchangeInfo(hash, momijiUserAccount);
    console.log(result);
    expect(result).toHaveProperty('productInfo');
  }, 10000); // 10 seconds
  it('should return a exchangeInfo from seller', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = '0B436B10199D53276565E5BB71AF1E02A9928DAC9BD0006EFFEC41F45F0980E8';
    const momijiSellerAccount = Account.createFromPrivateKey('ACE601DF0DE67888FC67FD7D800A3995AC3005C93F057D9BFFCDD94C5BF48F89', momijiBlockChain.networkType);
    const result = await fetchExchangeInfo(hash, momijiSellerAccount);
    console.log(result);
    expect(result).toHaveProperty('productInfo');
  }, 10000); // 10 seconds
  it('should return a exchangeInfo from admin', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = '0B436B10199D53276565E5BB71AF1E02A9928DAC9BD0006EFFEC41F45F0980E8';
    const momijiAdminAccount = Account.createFromPrivateKey('6EF158AF3D10FEAC84FFAF81991F10E19A3C9F709227FC222D70E3F5E83FD230', momijiBlockChain.networkType);
    const result = await fetchExchangeInfo(hash, momijiAdminAccount);
    console.log(result);
    expect(result).toHaveProperty('productInfo');
  }, 10000); // 10 seconds
  test.skip('should throw an error if Failed to parse ExchangeOverview object', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = '6CD090F72589006577D48872BE8736D6D6F0C4CD0BA99BDB4C5E7E5295D95B67';
    const momijiUserAccount = Account.createFromPrivateKey('D8A03500647C68D715FD2B9C043D6E20EEADE2D4FE7B88DA5F84C240B00C7DC2', momijiBlockChain.networkType);
    await expect(fetchExchangeInfo(hash, momijiUserAccount)).rejects.toThrow(
      'Failed to parse ExchangeOverview object',
    );
  }, 10000); // 10 seconds
});
