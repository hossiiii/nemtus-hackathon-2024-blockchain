import fetch from 'node-fetch';
global.fetch = fetch;

import { Address } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { fetchExchangeHistoryInfo } from './fetchExchangeHistoryInfo';

describe('fetchExchangeHistoryInfo', () => {
  it('should return a exchangeHistoryInfo from user', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiUserAddress = Address.createFromRawAddress('TBBELSFSZAZYCUBKH3NXNP24M5LLHXVD7TIHUYY');
    const result = await fetchExchangeHistoryInfo(momijiBlockChain, momijiUserAddress);
    console.log(result);
  }, 10000); // 10 seconds
  it('should return a exchangeHistoryInfo from seller', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiSellerAddress = Address.createFromRawAddress('TAF7SZWMAH72CVMKPNGLDZHGLLPST3ULSKI47VQ');
    const result = await fetchExchangeHistoryInfo(momijiBlockChain, momijiSellerAddress);
    console.log(result);
  }, 10000); // 10 seconds
  it('should return a exchangeHistoryInfo from admin', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAdminAddress = Address.createFromRawAddress('TAQ34WZSBWWOEEEKZD23HMJCT5WIL6LPH44PO5A');
    const result = await fetchExchangeHistoryInfo(momijiBlockChain, momijiAdminAddress);
    console.log(result);
  }, 10000); // 10 seconds

});
