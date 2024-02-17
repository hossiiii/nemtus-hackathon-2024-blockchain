import { AccountInfo, Address, MosaicId, MosaicInfo, Order, TransactionGroup, TransferTransaction } from 'symbol-sdk';
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
  let amount = accountInfo.mosaics.find((mosaic) => mosaic.id.equals(mosaicId))?.amount.compact() || 0;

  //　現在注文が入っている部分の取得
  let amoutPartial = 0;
  const transactions = await firstValueFrom(momijiBlockChain.txRepo.search({
    group: TransactionGroup.Partial,
    transferMosaicId: mosaicId,
    embedded: true,
    order:Order.Desc,
    pageSize:30
  }));
  
  transactions.data.forEach((tx:TransferTransaction) => {
    amoutPartial = amoutPartial + tx.mosaics[0].amount.compact()
    console.log(amoutPartial)
  });

  amount = amount - amoutPartial;

  return {amount ,total};
};