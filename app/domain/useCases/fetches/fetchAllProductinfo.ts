import { AccountInfo, Address, KeyGenerator, Metadata, MetadataType, MosaicId, MosaicInfo, Page } from 'symbol-sdk';
import { ProductInfo } from '../../entities/productInfo/productInfo';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { serviceName } from '../../../consts/consts';
import { fetchProductStock } from './fetchProductStock';

export const fetchAllProductinfo = async (
  address?: Address,
): Promise<ProductInfo[]> => {
  const momijiBlockChain = await setupBlockChain('momiji');
  const key = 'productInfo';
  const uint64keyToHex = KeyGenerator.generateUInt64Key(key).toHex();

  // メタデータに設定された情報を取得
  const metadataEntries :Page<Metadata> = await firstValueFrom(
    momijiBlockChain.metaRepo.search({
      metadataType: MetadataType.Mosaic,
      scopedMetadataKey: uint64keyToHex,
      pageNumber: 1,
      pageSize: 1000
  }),
  ) as any;

  // console.log(metadataEntries);

  let productInfoList: ProductInfo[] = [];

  for (let index = 0; index < metadataEntries.data.length; index++) {
    const value = metadataEntries.data[index].metadataEntry.value;
    let productInfo:ProductInfo
    try {
      productInfo = JSON.parse(value) as ProductInfo;
      if(productInfo.serviceName == process.env.NEXT_PUBLIC_APP_NAME){
        productInfoList.push(productInfo);
        // 在庫があるかどうかを確認
        // const res = await fetchProductStock(Address.createFromRawAddress(productInfo.ownerAddress), new MosaicId(productInfo.mosaicId) );
        // if(res.amount > 0) productInfoList.push(productInfo); // 条件を満たす値をリストに追加
        // console.log(value);
      }
    } catch (error) {
      console.error(`Error parsing product info for mosaic ${metadataEntries.data[index].metadataEntry.targetId.toHex()}: ${error}`); // オプション: エラーをログに記録
      continue; // JSONのパースに失敗した場合は次のモザイクへ進む
    }

    // followDict[index] = {
    //     "address": metadataEntries.data[index].metadataEntry.targetAddress.plain(),
    // }
  }



  // for(let i = 0; i < followDict.length; i++) {

  //   // アカウントリストからモザイクを取得
  //   const mosaics :Page<MosaicInfo> = await firstValueFrom(
  //     momijiBlockChain.mosaicRepo.search({
  //       ownerAddress: Address.createFromRawAddress(followDict[i].address),
  //     }),
  //   ) as any;

  //   for (const mosaic of mosaics.data) {
  //     const mosaicId = mosaic.id;
  //     const uint64keyToHex = KeyGenerator.generateUInt64Key(key).toHex();
  //     const res = await firstValueFrom(
  //       momijiBlockChain.metaRepo.search({
  //         metadataType: MetadataType.Mosaic,
  //         scopedMetadataKey: uint64keyToHex,
  //         targetId: mosaicId,
  //       }),
  //     ) as any;

  //     if (!res.data || !res.data[0] || !res.data[0].metadataEntry) {
  //       continue; // 条件を満たさない場合は次のループへ
  //     }

  //     const value = res.data[0].metadataEntry.value;

  //     let productInfo:ProductInfo

  //     try {
  //       productInfo = JSON.parse(value) as ProductInfo;
  //       if(productInfo.serviceName == process.env.NEXT_PUBLIC_APP_NAME){
  //         //在庫があるかどうかを確認
  //         const res = await fetchProductStock(Address.createFromRawAddress(followDict[i].address), mosaicId);
  //         if(res.amount > 0) productInfoList.push(productInfo); // 条件を満たす値をリストに追加
  //       }
  //     } catch (error) {
  //       console.error(`Error parsing product info for mosaic ${mosaicId.toHex()}: ${error}`); // オプション: エラーをログに記録
  //       continue; // JSONのパースに失敗した場合は次のモザイクへ進む
  //     }
  //   }
  //  }

   //リストの並びを反対にする
    productInfoList = productInfoList.reverse();

  return productInfoList;
};

