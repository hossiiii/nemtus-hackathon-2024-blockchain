import { AccountInfo, Address, KeyGenerator, Metadata, MetadataType, MosaicInfo, Page } from 'symbol-sdk';
import { ProductInfo } from '../../entities/productInfo/productInfo';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { serviceName } from '../../../consts/consts';

export const fetchAllProductinfo = async (
  address?: Address,
): Promise<ProductInfo[]> => {
  const momijiBlockChain = await setupBlockChain('momiji');
  const momijiKey = KeyGenerator.generateUInt64Key(serviceName).toHex();
  const key = 'productInfo';

  // メタデータに設定された情報を取得
  const metadataEntries :Page<Metadata> = await firstValueFrom(
    momijiBlockChain.metaRepo.search({
      metadataType: MetadataType.Account,
      scopedMetadataKey: momijiKey,
      pageNumber: 1,
      pageSize: 1000
  }),
  ) as any;

  const followDict = [];
  for (let index = 0; index < metadataEntries.data.length; index++) {
    followDict[index] = {
        "address": metadataEntries.data[index].metadataEntry.targetAddress.plain(),
    }
  }


  let productInfoList: ProductInfo[] = [];

  for(let i = 0; i < followDict.length; i++) {

    // アカウントリストからモザイクを取得
    const mosaics :Page<MosaicInfo> = await firstValueFrom(
      momijiBlockChain.mosaicRepo.search({
        ownerAddress: Address.createFromRawAddress(followDict[i].address),
      }),
    ) as any;

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
        if(productInfo.serviceName == process.env.NEXT_PUBLIC_APP_NAME){
          productInfoList.push(productInfo); // 条件を満たす値をリストに追加
        }
      } catch (error) {
        console.error(`Error parsing product info for mosaic ${mosaicId.toHex()}: ${error}`); // オプション: エラーをログに記録
        continue; // JSONのパースに失敗した場合は次のモザイクへ進む
      }
    }
   }

  return productInfoList;
};

