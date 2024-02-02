import fetch from 'node-fetch';
global.fetch = fetch;

import { fetchTransactionStatus } from './fetchTransactionStatus';
import { Address, TransactionStatus } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';

describe('fetchTransactionStatus', () => {
  it('should return a symbol transaction status', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );
    const symbolHash = '0F8F46060350F8784E1A3A012EA6F707BB95FCA70EA9EAB0058AC4661F84AB2D';
    const result = await fetchTransactionStatus(symbolBlockChain, symbolHash, symbolAddress);
    expect(result).toBeInstanceOf(TransactionStatus);
    expect(result.code).toEqual('Success');
    expect(result.group).toEqual('confirmed');
  }, 10000); // 10 seconds
  it('should throw an symbol error if not found', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );
    const symbolHash = '0F8F46060350F8784E1A3A012EA6F707BB95FCA70EA9EAB0058AC4661F84AB2C';
    await expect(
      fetchTransactionStatus(symbolBlockChain, symbolHash, symbolAddress),
    ).rejects.toThrow(/Not Found/i);
  }, 10000); // 10 seconds
  it('should return a momiji transaction status', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );
    const momijiHash = '8DAE406DF817A1F7B3C61142A3A9D4693033A64D11B7A43F5888A7A5AB98DC15';
    const result = await fetchTransactionStatus(momijiBlockChain, momijiHash, momijiAddress);
    expect(result).toBeInstanceOf(TransactionStatus);
    expect(result.code).toEqual('Success');
    expect(result.group).toEqual('confirmed');
  }, 10000); // 10 seconds
  //TODO patialでの検知を追加
  it('should throw an momiji error if not found', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );
    const momijiHash = '8DAE406DF817A1F7B3C61142A3A9D4693033A64D11B7A43F5888A7A5AB98DC16';
    await expect(
      fetchTransactionStatus(momijiBlockChain, momijiHash, momijiAddress),
    ).rejects.toThrow(/Not Found/i);
  }, 10000); // 10 seconds
});
