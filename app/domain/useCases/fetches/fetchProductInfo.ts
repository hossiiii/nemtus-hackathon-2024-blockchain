import { MosaicId } from 'symbol-sdk';
import { ProductInfo } from '../../entities/productInfo/productInfo';
import { fetchMosaicMetaData } from '../../utils/fetches/fetchMosaicMetaData';
import { setupBlockChain } from '../../utils/setupBlockChain';

export const fetchProductInfo = async (
  mosaicId: MosaicId,
): Promise<ProductInfo> => {
  const momijiBlockChain = await setupBlockChain('momiji');
  const key = 'productInfo';
  const mosaicMetaData = await fetchMosaicMetaData(momijiBlockChain, key, mosaicId);

  // `fetchMosaicMetaData`から`null`が返された場合
  if (mosaicMetaData === null) {
    throw new Error('Failed to fetch mosaic meta data');
  }

  let productInfo: ProductInfo;
  try {
    productInfo = JSON.parse(mosaicMetaData) as ProductInfo;
  } catch (error) {
    throw new Error('Failed to parse mosaic meta data');
  }

  return productInfo;
};