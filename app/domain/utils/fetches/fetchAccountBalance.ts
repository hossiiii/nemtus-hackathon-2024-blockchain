import { AccountInfo, Address, MosaicId, MosaicInfo } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchAccountBalance = async (
  blockChain: any,
  address: Address,
  mosaicId: MosaicId
): Promise<number> => {
  const accountInfo: AccountInfo = await firstValueFrom(
    blockChain.accountRepo.getAccountInfo(address),
  );
  let amount;
  const mosaicAmount:string = accountInfo.mosaics.find((mosaic) => mosaic.id.equals(mosaicId))?.amount.compact().toString() || "";
  const mosaicInfo : MosaicInfo = await firstValueFrom(blockChain.mosaicRepo.getMosaic(mosaicId));
  const divisibility = mosaicInfo.divisibility; //可分性
  if(divisibility > 0){
    amount = mosaicAmount.slice(0,mosaicAmount.length-divisibility)  
    + "." + mosaicAmount.slice(-divisibility);
  }else{
    amount = mosaicAmount;
  }
  return Number(amount);
};
