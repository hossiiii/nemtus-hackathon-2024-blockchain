import { AccountInfo, Address, KeyGenerator, MetadataType, MosaicInfo, Page } from 'symbol-sdk';
import { ProductInfo } from '../../entities/productInfo/productInfo';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';

export const fetchSellerProductInfo = async (
  address: Address,
): Promise<ProductInfo[]> => {
  const momijiBlockChain = await setupBlockChain('momiji');
  const key = 'productInfo';

  const mosaics :Page<MosaicInfo> = await firstValueFrom(
    momijiBlockChain.mosaicRepo.search({
      ownerAddress: address,
    }),
  ) as any;

  let productInfoList: ProductInfo[] = [];

  for (const mosaic of mosaics.data) {
    const mosaicId = mosaic.id;
    const uint64keyToHex = KeyGenerator.generateUInt64Key(key).toHex();
    const res = await firstValueFrom(
      momijiBlockChain.metaRepo.search({
        metadataType: MetadataType.Mosaic,
        scopedMetadataKey: uint64keyToHex,
        targetId: mosaicId,
      }),
    ) as any;

    if (!res.data || !res.data[0] || !res.data[0].metadataEntry) {
      continue; // 条件を満たさない場合は次のループへ
    }

    const value = res.data[0].metadataEntry.value;

    let productInfo:ProductInfo

    try {
      productInfo = JSON.parse(value) as ProductInfo;
      productInfoList.push(productInfo); // 条件を満たす値をリストに追加
    } catch (error) {
      console.error(`Error parsing product info for mosaic ${mosaicId.toHex()}: ${error}`); // オプション: エラーをログに記録
      continue; // JSONのパースに失敗した場合は次のモザイクへ進む
    }
  }

  return productInfoList;
};

