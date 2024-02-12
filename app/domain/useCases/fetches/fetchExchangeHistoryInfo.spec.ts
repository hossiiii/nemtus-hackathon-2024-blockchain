import fetch from 'node-fetch';
global.fetch = fetch;

import { Account } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { fetchExchangeHistoryInfo } from './fetchExchangeHistoryInfo';

describe('fetchExchangeHistoryInfo', () => {
  it('should return a exchangeHistoryInfo from user', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiUserAccount = Account.createFromPrivateKey('D8A03500647C68D715FD2B9C043D6E20EEADE2D4FE7B88DA5F84C240B00C7DC2', momijiBlockChain.networkType);
    const result = await fetchExchangeHistoryInfo(momijiUserAccount);
    console.log(result);
  }, 10000); // 10 seconds
  it('should return a exchangeHistoryInfo from seller', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiSellerAccount = Account.createFromPrivateKey('ACE601DF0DE67888FC67FD7D800A3995AC3005C93F057D9BFFCDD94C5BF48F89', momijiBlockChain.networkType);
    const result = await fetchExchangeHistoryInfo(momijiSellerAccount);
    console.log(result);
  }, 10000); // 10 seconds
  it('should return a exchangeHistoryInfo from admin', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAdminAccount = Account.createFromPrivateKey('6EF158AF3D10FEAC84FFAF81991F10E19A3C9F709227FC222D70E3F5E83FD230', momijiBlockChain.networkType);
    const result = await fetchExchangeHistoryInfo(momijiAdminAccount);
    console.log(result);
  }, 10000); // 10 seconds

});
