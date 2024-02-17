import { AccountInfo, Address, PublicAccount, ReceiptType, TransactionStatement, TransactionStatementSearchCriteria, UInt64 } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchReceiptInfo = async (
  blockChain: any,
  address: Address,
  height: number,
): Promise<TransactionStatement[]> => {
  const receipts = await firstValueFrom(
    blockChain.receiptRepo.searchReceipts({
      targetAddress: address,
      height: height,
      receiptTypes: [ReceiptType.LockSecret_Completed],  
    }),
  ) as any;
  if (receipts.data && receipts.data.length > 0) {
    return receipts.data;
  }else{
    return [];    
  }
};
