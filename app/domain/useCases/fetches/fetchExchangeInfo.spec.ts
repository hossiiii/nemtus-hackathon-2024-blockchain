import fetch from 'node-fetch';
global.fetch = fetch;

import { Account } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { fetchExchangeInfo } from './fetchExchangeInfo';

describe('fetchExchangeInfo', () => {
  it('should return a exchangeInfo from user', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = '5157DA2B5AE4F06A392D2411BA639E24E25298723CDAAABCF3548CEE886BD874';
    const momijiUserAccount = Account.createFromPrivateKey('70859634CCA9AFFE445BB8D46582674C38F884F89CC49561DC89CAE7DECD9E1F', momijiBlockChain.networkType);
    const result = await fetchExchangeInfo(momijiBlockChain, hash, momijiUserAccount);
    console.log(result);
    expect(result).toHaveProperty('productInfo');
  }, 10000); // 10 seconds
  it('should return a exchangeInfo from seller', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = '5157DA2B5AE4F06A392D2411BA639E24E25298723CDAAABCF3548CEE886BD874';
    const momijiSellerAccount = Account.createFromPrivateKey('ECE421DCE7BE8FD772BEC011EE317B003630DD194425CCFF9C7125258AEB1445', momijiBlockChain.networkType);
    const result = await fetchExchangeInfo(momijiBlockChain, hash, momijiSellerAccount);
    console.log(result);
    expect(result).toHaveProperty('productInfo');
  }, 10000); // 10 seconds
  it('should return a exchangeInfo from admin', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = '5157DA2B5AE4F06A392D2411BA639E24E25298723CDAAABCF3548CEE886BD874';
    const momijiAdminAccount = Account.createFromPrivateKey('6EF158AF3D10FEAC84FFAF81991F10E19A3C9F709227FC222D70E3F5E83FD230', momijiBlockChain.networkType);
    const result = await fetchExchangeInfo(momijiBlockChain, hash, momijiAdminAccount);
    console.log(result);
    expect(result).toHaveProperty('productInfo');
  }, 10000); // 10 seconds
  test.skip('should throw an error if Failed to parse ExchangeOverview object', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const hash = '5157DA2B5AE4F06A392D2411BA639E24E25298723CDAAABCF3548CEE886BD874';
    const momijiUserAccount = Account.createFromPrivateKey('D8A03500647C68D715FD2B9C043D6E20EEADE2D4FE7B88DA5F84C240B00C7DC2', momijiBlockChain.networkType);
    await expect(fetchExchangeInfo(momijiBlockChain, hash, momijiUserAccount)).rejects.toThrow(
      'Failed to parse ExchangeOverview object',
    );
  }, 10000); // 10 seconds
});
