import fetch from 'node-fetch';
global.fetch = fetch;

import { Account } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { fetchExchangeHistoryInfo } from './fetchExchangeHistoryInfo';

describe('fetchExchangeHistoryInfo', () => {
  it('should return a exchangeHistoryInfo from user', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiUserAccount = Account.createFromPrivateKey('85425CE250D4CFB863B2DC24327C7736F57AE8BB0FCD7E56D3FC504D97FBE556', momijiBlockChain.networkType);
    const result = await fetchExchangeHistoryInfo(momijiUserAccount);
    console.log(result);
  }, 10000); // 10 seconds
  it('should return a exchangeHistoryInfo from seller', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiSellerAccount = Account.createFromPrivateKey('C894D31AFAB1C35E909524040C78F1E7A7FE1F32797B35E52BD498EDFDADD9E8', momijiBlockChain.networkType);
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
