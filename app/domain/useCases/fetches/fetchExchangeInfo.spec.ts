import fetch from 'node-fetch';
global.fetch = fetch;

import { Account } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { fetchExchangeInfo } from './fetchExchangeInfo';

describe('fetchExchangeInfo', () => {
  it('should return a exchangeInfo from user', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = 'E8E53EA06D716224BA5676F9F53D070B87F80BC4215868387B48EF1AFC37C0C1';
    const momijiUserAccount = Account.createFromPrivateKey('85425CE250D4CFB863B2DC24327C7736F57AE8BB0FCD7E56D3FC504D97FBE556', momijiBlockChain.networkType);
    const result = await fetchExchangeInfo(hash, momijiUserAccount);
    console.log(result);
    expect(result).toHaveProperty('productInfo');
  }, 10000); // 10 seconds
  it('should return a exchangeInfo from seller', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = 'E8E53EA06D716224BA5676F9F53D070B87F80BC4215868387B48EF1AFC37C0C1';
    const momijiSellerAccount = Account.createFromPrivateKey('C894D31AFAB1C35E909524040C78F1E7A7FE1F32797B35E52BD498EDFDADD9E8', momijiBlockChain.networkType);
    const result = await fetchExchangeInfo(hash, momijiSellerAccount);
    console.log(result);
    expect(result).toHaveProperty('productInfo');
  }, 10000); // 10 seconds
  it('should return a exchangeInfo from admin', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = 'E8E53EA06D716224BA5676F9F53D070B87F80BC4215868387B48EF1AFC37C0C1';
    const momijiAdminAccount = Account.createFromPrivateKey('6EF158AF3D10FEAC84FFAF81991F10E19A3C9F709227FC222D70E3F5E83FD230', momijiBlockChain.networkType);
    const result = await fetchExchangeInfo(hash, momijiAdminAccount);
    console.log(result);
    expect(result).toHaveProperty('productInfo');
  }, 10000); // 10 seconds
  it('should throw an error if Failed to parse ExchangeOverview object', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = '6CD090F72589006577D48872BE8736D6D6F0C4CD0BA99BDB4C5E7E5295D95B67';
    const momijiUserAccount = Account.createFromPrivateKey('85425CE250D4CFB863B2DC24327C7736F57AE8BB0FCD7E56D3FC504D97FBE556', momijiBlockChain.networkType);
    await expect(fetchExchangeInfo(hash, momijiUserAccount)).rejects.toThrow(
      'Failed to parse ExchangeOverview object',
    );
  }, 10000); // 10 seconds
});
