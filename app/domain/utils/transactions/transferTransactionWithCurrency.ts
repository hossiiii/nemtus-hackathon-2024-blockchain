import {
  TransferTransaction,
  Deadline,
  Transaction,
  Address,
  EmptyMessage,
  Mosaic,
  MosaicId,
  UInt64,
} from 'symbol-sdk';

export const transferTransactionWithCurrency = (
  blockChain: any,
  amount: number,
  targetAddress: Address,
): Transaction => {
  const transferTx = TransferTransaction.create(
    Deadline.create(blockChain.epochAdjustment),
    targetAddress,
    [new Mosaic(new MosaicId(blockChain.currencyMosaicId), UInt64.fromUint(amount * 1000000))],
    EmptyMessage,
    blockChain.networkType,
  ).setMaxFee(100);
  return transferTx;
};
