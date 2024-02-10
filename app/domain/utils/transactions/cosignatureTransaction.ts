import { firstValueFrom } from 'rxjs';
import { CosignatureTransaction, TransactionGroup, AggregateTransaction } from 'symbol-sdk';

export const cosignatureTransaction = async (
  blockChain: any,
  hash: string,
): Promise<CosignatureTransaction> => {
  const aggregateBondedTxInfo = await firstValueFrom(blockChain.txRepo.getTransaction(hash, TransactionGroup.Partial)) as AggregateTransaction;
  const cosignatureTransaction:CosignatureTransaction = CosignatureTransaction.create(aggregateBondedTxInfo);
  return cosignatureTransaction;
};
