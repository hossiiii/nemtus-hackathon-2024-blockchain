import fetch from 'node-fetch';
global.fetch = fetch;

import { MosaicId } from 'symbol-sdk';
import { fetchProductInfo } from './fetchProductInfo';

describe('fetchProductInfo', () => {
  it('should return a metadata value', async () => {
    const mosaicIdHex = '60CF4EF5A7133B40';
    const mosaicId = new MosaicId(mosaicIdHex);
    const result = await fetchProductInfo(mosaicId);
    console.log(result);
    expect(result).toHaveProperty('serviceName');

  }, 10000); // 10 seconds
  it('should throw an error if Failed to parse mosaic meta data', async () => {
    const mosaicIdHex = '7FDD42E622614731';
    const mosaicId = new MosaicId(mosaicIdHex);
    await expect(fetchProductInfo(mosaicId)).rejects.toThrow(
      'Failed to parse mosaic meta data',
    );
  }, 10000); // 10 seconds
});
