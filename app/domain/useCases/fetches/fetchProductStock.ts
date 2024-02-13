import { AccountInfo, Address, MosaicId, MosaicInfo } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';

export const fetchProductStock = async (
  address: Address,
  mosaicId: MosaicId,
): Promise<{amount:number, total:number}> => {
  const momijiBlockChain = await setupBlockChain('momiji');

  const mosaicInfo: MosaicInfo = await firstValueFrom(
    momijiBlockChain.mosaicRepo.getMosaic(mosaicId),
  );
  const total = mosaicInfo.supply.compact()

  const accountInfo: AccountInfo = await firstValueFrom(
    momijiBlockChain.accountRepo.getAccountInfo(address),
  );

  let amount = 0
  for (const mosaic of accountInfo.mosaics) {
    if(mosaic.id.toHex() == mosaicId.toHex()){
      amount = mosaic.amount.compact()
    }
  }

  return {amount,total};
};