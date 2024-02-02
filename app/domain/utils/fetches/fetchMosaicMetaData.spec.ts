import fetch from 'node-fetch';
global.fetch = fetch;

import { MosaicId } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { fetchMosaicMetaData } from './fetchMosaicMetaData';

describe('fetchMosaicMetaData', () => {
  it('should return a metadata value', async () => {
    const mosaicIdHex = '6C00E8BB527946B9';
    const mosaicId = new MosaicId(mosaicIdHex);
    const momijiBlockChain = await setupBlockChain('momiji');
    const key = 'productInfo';
    const result = await fetchMosaicMetaData(momijiBlockChain, key, mosaicId);
    console.log(result);
    expect(result).toContain('kojinkanbaibai');
  }, 10000); // 10 seconds
  it('should throw an error if metadataEntry is not found', async () => {
    const mosaicIdHex = '6C00E8BB527946B9';
    const mosaicId = new MosaicId(mosaicIdHex);
    const momijiBlockChain = await setupBlockChain('momiji');
    const key = 'xxxx';
    const result = await fetchMosaicMetaData(momijiBlockChain, key, mosaicId);
    console.log(result);
    expect(result).toBeNull();
  }, 10000); // 10 seconds
});
